import { NextRequest, NextResponse } from "next/server"
import { apolloClient } from "@/lib/apollo-client"
import { GET_POOLS } from "@/graphql/pools"
import { CONFIG_KEYS } from "@interest-protocol/memez-fun-sdk"
import { redisGet, redisSetEx, CACHE_PREFIX, CACHE_TTL } from "@/lib/redis/client"
import { nexaServerClient } from "@/lib/nexa-server"

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams

		const page = Number(searchParams.get("page")) || 1
		const pageSize = Math.min(Number(searchParams.get("pageSize")) || 20, 100)
		const category = searchParams.get("category") as "new" | "graduating" | "graduated" | null
		const sortField = searchParams.get("sortField") || "createdAt"
		const sortDirection = searchParams.get("sortDirection") || "DESC"

		const { data } = await apolloClient.query({
			query: GET_POOLS,
			variables: {
				page: 1,
				pageSize: 100
			},
			context: {
				headers: {
					"config-key": CONFIG_KEYS.mainnet.XPUMP
				}
			},
			fetchPolicy: "network-only"
		})

		if (!data?.pools?.pools) {
			throw new Error("No pools data received")
		}

		let pools = [...data.pools.pools]

		if (category) {
			switch (category) {
				case "new":
					pools = pools.filter(p => !p.migrated && parseFloat(p.bondingCurve) < 75)
					break
				case "graduating":
					pools = pools.filter(p => !p.migrated && parseFloat(p.bondingCurve) >= 75)
					break
				case "graduated":
					pools = pools.filter(p => p.migrated === true)
					break
			}
		}

		pools.sort((a, b) => {
			let aValue: any, bValue: any

			switch (sortField) {
				case "bondingCurve":
					aValue = parseFloat(a.bondingCurve) || 0
					bValue = parseFloat(b.bondingCurve) || 0
					break
				case "createdAt":
					aValue = typeof a.createdAt === "string" ? parseInt(a.createdAt) : a.createdAt || 0
					bValue = typeof b.createdAt === "string" ? parseInt(b.createdAt) : b.createdAt || 0
					break
				case "lastTradeAt":
					aValue = typeof a.lastTradeAt === "string" ? parseInt(a.lastTradeAt) : a.lastTradeAt || 0
					bValue = typeof b.lastTradeAt === "string" ? parseInt(b.lastTradeAt) : b.lastTradeAt || 0
					break
				case "quoteBalance":
					aValue = parseFloat(a.quoteBalance) || 0
					bValue = parseFloat(b.quoteBalance) || 0
					break
				default:
					aValue = a[sortField] || 0
					bValue = b[sortField] || 0
			}

			return sortDirection === "DESC" ? bValue - aValue : aValue - bValue
		})

		const startIndex = (page - 1) * pageSize
		const paginatedPools = pools.slice(startIndex, startIndex + pageSize)

		const processedPools = await Promise.all(
			paginatedPools.map(async (pool) => {
				const processedPool: any = {
					...pool,
					isProtected: !!pool.publicKey,
				}

				// rry to get cached market data and metadata separately
				const marketCacheKey = `${CACHE_PREFIX.MARKET_DATA}${pool.coinType}`
				const metadataCacheKey = `${CACHE_PREFIX.COIN_METADATA}${pool.coinType}`

				const [cachedMarketData, cachedMetadata] = await Promise.all([
					redisGet(marketCacheKey),
					redisGet(metadataCacheKey)
				])

				if (cachedMarketData) {
					try {
						processedPool.marketData = JSON.parse(cachedMarketData)
					} catch (error) {
						console.error(`Failed to parse cached market data for ${pool.coinType}:`, error)
					}
				}

				if (cachedMetadata) {
					try {
						processedPool.coinMetadata = JSON.parse(cachedMetadata)
					} catch (error) {
						console.error(`Failed to parse cached metadata for ${pool.coinType}:`, error)
					}
				}

				// if no cached data, fetch from nexa
				if (!processedPool.marketData) {
					try {
						const marketData = await nexaServerClient.getMarketData(pool.coinType)

						// extract coinMetadata for separate caching
						const { coinMetadata, ...restMarketData } = marketData

						// trim market data to only what we need
						const trimmedMarketData = {
							coinPrice: restMarketData.coinPrice,
							isCoinHoneyPot: restMarketData.isCoinHoneyPot,
							totalLiquidityUsd: restMarketData.totalLiquidityUsd,
							liqUsd: restMarketData.totalLiquidityUsd, // Map for backward compatibility
							marketCap: restMarketData.marketCap,
							coin24hTradeCount: restMarketData.coin24hTradeCount,
							coin24hTradeVolumeUsd: restMarketData.coin24hTradeVolumeUsd,
							price1DayAgo: restMarketData.price1DayAgo,
							holdersCount: restMarketData.holdersCount
						}

						processedPool.marketData = trimmedMarketData
						processedPool.coinMetadata = coinMetadata

						// cache the trimmed market data WITHOUT coinMetadata to reduce size
						await redisSetEx(
							marketCacheKey,
							CACHE_TTL.MARKET_DATA,
							JSON.stringify(trimmedMarketData)
						)

						// cache coinMetadata separately with longer TTL
						if (coinMetadata) {
							const metadataCacheKey = `${CACHE_PREFIX.COIN_METADATA}${pool.coinType}`
							await redisSetEx(
								metadataCacheKey,
								CACHE_TTL.COIN_METADATA,
								JSON.stringify(coinMetadata)
							)
						}
					} catch (error) {
						console.error(`Failed to fetch market data for ${pool.coinType}:`, error)

						// try to get just cached metadata if market data fails
						const metadataCacheKey = `${CACHE_PREFIX.COIN_METADATA}${pool.coinType}`
						const cachedMetadata = await redisGet(metadataCacheKey)
						if (cachedMetadata) {
							try {
								processedPool.coinMetadata = JSON.parse(cachedMetadata)
							} catch (e) {
								console.error(`Failed to parse cached metadata for ${pool.coinType}:`, e)
							}
						}
					}
				}

				return processedPool
			})
		)

		return NextResponse.json({
			pools: processedPools,
			total: pools.length,
			page,
			pageSize
		})
	} catch (error) {
		console.error("Error fetching tokens:", error)
		return NextResponse.json(
			{ error: "Failed to fetch tokens" },
			{ status: 500 }
		)
	}
}