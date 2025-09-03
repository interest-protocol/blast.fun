import { NextResponse } from "next/server"
import { apolloClient } from "@/lib/apollo-client"
import { prisma } from "@/lib/prisma"
import { fetchCreatorsBatch } from "@/lib/fetch-creators-batch"
import { GET_COIN_POOL_BASIC } from "@/graphql/pools"

export const revalidate = 1

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url)

		// @dev: forward any filter params from client
		const params = new URLSearchParams()
		searchParams.forEach((value, key) => {
			params.append(key, value)
		})

		const response = await fetch(
			`https://spot.api.sui-prod.bluefin.io/internal-api/insidex/memezone/about-to-bond?platforms=xpump&${params}`,
			{
				headers: {
					"Accept": "application/json"
				},
				next: { revalidate: 1 }
			}
		)

		if (!response.ok) {
			throw new Error(`Bluefin API error: ${response.status}`)
		}

		const tokens = await response.json()
		const coinTypes = tokens.map((token: any) => token.coinType)

		if (coinTypes.length > 0) {
			try {
				const poolPromises = coinTypes.map((coinType: string) =>
					apolloClient.query({
						query: GET_COIN_POOL_BASIC,
						variables: { type: coinType },
						fetchPolicy: "no-cache",
						errorPolicy: "ignore"
					}).catch(err => {
						console.error(`Failed to fetch pool for ${coinType}:`, err)
						return { data: { coinPool: null } }
					})
				)

				const poolResults = await Promise.all(poolPromises)

				// lookup map
				const poolMap = new Map()
				poolResults.forEach((result, index) => {
					if (result.data?.coinPool) {
						poolMap.set(coinTypes[index], result.data.coinPool)
					}
				})

				// @dev: fetch protection settings for protected tokens
				const poolIds = Array.from(poolMap.values())
					.filter((p: any) => p?.publicKey)
					.map((p: any) => p.poolId)
				let protectionSettingsMap = new Map()

				if (poolIds.length > 0) {
					try {
						const protectionSettings = await prisma.tokenProtectionSettings.findMany({
							where: { poolId: { in: poolIds } },
							select: { poolId: true, settings: true }
						})
						protectionSettings.forEach(setting => {
							protectionSettingsMap.set(setting.poolId, setting.settings)
						})
					} catch (error) {
						console.error("Error fetching protection settings:", error)
					}
				}

				const creatorDataMap = await fetchCreatorsBatch(tokens, poolMap)
				const enhancedTokens = tokens.map((token: any) => {
					const pool = poolMap.get(token.coinType) as any
					const creatorAddress = pool?.creatorAddress || token.dev
					const creatorData = creatorDataMap.get(creatorAddress)

					return {
						...token,
						poolId: pool?.poolId || token.id,
						creatorAddress,
						metadata: pool?.metadata || {
							name: token.name,
							symbol: token.symbol,
							description: token.description,
							icon_url: token.iconUrl || token.icon_url
						},
						marketCap: token.marketCap || 0,
						holdersCount: token.holdersCount || 0,
						volume24h: (token.buyVolume || 0) + (token.sellVolume || 0),
						buyVolume: token.buyVolume || 0,
						sellVolume: token.sellVolume || 0,
						liquidity: token.liquidity || 0,
						price: token.price || 0,
						bondingCurve: pool?.bondingCurve || ((token.bondingProgress || 0) * 100),
						bondingProgress: pool?.migrated ? 100 : ((token.bondingProgress || 0) * 100),
						migrated: pool?.migrated || false,
						isProtected: !!pool?.publicKey,
						protectionSettings: pool?.publicKey ? protectionSettingsMap.get(pool.poolId) : undefined,
						creatorData
					}
				})

				return NextResponse.json(enhancedTokens, {
					headers: {
						"Cache-Control": "public, s-maxage=1, stale-while-revalidate=59"
					}
				})
			} catch (graphqlError) {
				console.error("GraphQL error:", graphqlError)
				return NextResponse.json(tokens, {
					headers: {
						"Cache-Control": "public, s-maxage=1, stale-while-revalidate=59"
					}
				})
			}
		}

		return NextResponse.json(tokens, {
			headers: {
				"Cache-Control": "public, s-maxage=1, stale-while-revalidate=59"
			}
		})
	} catch (error) {
		console.error("API error:", error)
		return NextResponse.json(
			{ error: "Failed to fetch tokens" },
			{ status: 500 }
		)
	}
}