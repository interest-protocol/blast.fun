import { apolloClient } from "@/lib/apollo-client"
import { prisma } from "@/lib/prisma"
import { fetchCreatorsBatch } from "@/lib/fetch-creators-batch"
import { GET_POOLS_BATCH } from "@/graphql/pools"

export async function enhanceTokensWithTimeout(
	tokens: any[],
	options: {
		enhancementTimeout?: number
		creatorTimeout?: number
		isBonded?: boolean
	} = {}
) {
	const {
		enhancementTimeout = 500,
		creatorTimeout = 200,
		isBonded = false
	} = options

	const coinTypes = tokens.map((token: any) => token.coinType)
	
	// @dev: Prepare basic tokens first
	const basicTokens = tokens.map((token: any) => ({
		...token,
		poolId: token.id,
		creatorAddress: token.dev,
		metadata: {
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
		bondingCurve: isBonded ? 100 : ((token.bondingProgress || 0) * 100),
		bondingProgress: isBonded ? 100 : ((token.bondingProgress || 0) * 100),
		migrated: isBonded || false,
		isProtected: false,
		burnTax: undefined,
		protectionSettings: undefined,
		creatorData: undefined,
		isEnhanced: false
	}))

	// @dev: Try to enhance with GraphQL data
	if (coinTypes.length === 0) {
		return { tokens: basicTokens, isEnhanced: false }
	}

	try {
		// @dev: Fetch pools with timeout
		const poolsResult = await Promise.race([
			apolloClient.query({
				query: GET_POOLS_BATCH,
				variables: { coinTypes },
				fetchPolicy: "no-cache",
				errorPolicy: "ignore"
			}),
			new Promise((_, reject) => 
				setTimeout(() => reject(new Error('Pool fetch timeout')), enhancementTimeout)
			)
		]) as any

		const poolMap = new Map()
		if (poolsResult?.data?.pools?.pools) {
			poolsResult.data.pools.pools.forEach((pool: any) => {
				if (pool) {
					poolMap.set(pool.coinType, pool)
				}
			})
		}

		// @dev: Quick fetch for protection settings
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

		// @dev: Try to get creator data with separate timeout
		const creatorDataMap = await Promise.race([
			fetchCreatorsBatch(tokens, poolMap),
			new Promise((resolve) => setTimeout(() => resolve(new Map()), creatorTimeout))
		]) as Map<string, any>

		// @dev: Build enhanced tokens
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
				bondingCurve: isBonded ? 100 : (pool?.bondingCurve || ((token.bondingProgress || 0) * 100)),
				bondingProgress: isBonded ? 100 : (pool?.migrated ? 100 : ((token.bondingProgress || 0) * 100)),
				migrated: isBonded ? true : (pool?.migrated || false),
				isProtected: !!pool?.publicKey,
				burnTax: pool?.burnTax,
				protectionSettings: pool?.publicKey ? protectionSettingsMap.get(pool.poolId) : undefined,
				creatorData,
				isEnhanced: true
			}
		})

		return { tokens: enhancedTokens, isEnhanced: true }
	} catch (error) {
		console.log("Enhancement failed or timed out:", error.message || error)
		return { tokens: basicTokens, isEnhanced: false }
	}
}