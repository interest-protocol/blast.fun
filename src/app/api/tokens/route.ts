import { NextRequest, NextResponse } from "next/server"
import { apolloClient } from "@/lib/apollo-client"
import { GET_POOLS } from "@/graphql/pools"
import { CONFIG_KEYS } from "@interest-protocol/memez-fun-sdk"
import { redisGet, redisSetEx, CACHE_PREFIX, CACHE_TTL } from "@/lib/redis/client"
import { nexaServerClient } from "@/lib/nexa-server"
import { fetchCreatorData } from "@/lib/fetch-creator-data"

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams

		const page = Number(searchParams.get("page")) || 1
		const pageSize = Math.min(Number(searchParams.get("pageSize")) || 20, 100)
		const category = searchParams.get("category") as "new" | "graduating" | "graduated" | null
		const sortField = searchParams.get("sortField") || "createdAt"
		const sortDirection = searchParams.get("sortDirection") || "DESC"

		let allPools: any[] = []
		let totalPoolsCount = 0

		// For "new" category, just fetch once with the requested pageSize
		// For "graduating" and "graduated", fetch multiple pages until we have enough
		if (category === "new" || !category) {
			const { data } = await apolloClient.query({
				query: GET_POOLS,
				variables: {
					page: page,
					pageSize: pageSize,
					sortField: sortField,
					sortDirection: sortDirection
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

			allPools = data.pools.pools
			totalPoolsCount = data.pools.total

			// Filter for "new" category if specified
			if (category === "new") {
				allPools = allPools.filter(p => !p.migrated && parseFloat(p.bondingCurve) < 50)
			}
		} else {
			// For "graduating" and "graduated", fetch multiple pages
			let currentPage = 1
			const batchSize = 100 // Fetch 100 at a time from GraphQL
			let shouldContinue = true

			while (shouldContinue) {
				const { data } = await apolloClient.query({
					query: GET_POOLS,
					variables: {
						page: currentPage,
						pageSize: batchSize,
						sortField: sortField,
						sortDirection: sortDirection
					},
					context: {
						headers: {
							"config-key": CONFIG_KEYS.mainnet.XPUMP
						}
					},
					fetchPolicy: "network-only"
				})

				if (!data?.pools?.pools) {
					break
				}

				const fetchedPools = data.pools.pools
				totalPoolsCount = data.pools.total

				// Filter pools based on category
				let filteredPools = fetchedPools
				switch (category) {
					case "graduating":
						filteredPools = fetchedPools.filter((p: any) => !p.migrated && parseFloat(p.bondingCurve) >= 50)
						break
					case "graduated":
						filteredPools = fetchedPools.filter((p: any) => p.migrated === true)
						break
				}

				allPools = [...allPools, ...filteredPools]

				// Stop conditions
				if (category === "graduating") {
					// For graduating, stop if we have enough OR if there are no more pools with bondingCurve >= 50
					const hasHighBondingCurve = fetchedPools.some((p: any) => !p.migrated && parseFloat(p.bondingCurve) >= 50)
					shouldContinue = allPools.length < pageSize && hasHighBondingCurve && (currentPage * batchSize) < totalPoolsCount
				} else {
					// For graduated, stop if we have enough pools or reached the end
					shouldContinue = allPools.length < pageSize && (currentPage * batchSize) < totalPoolsCount
				}

				currentPage++

				// Safety limit to prevent infinite loops
				if (currentPage > 10) {
					break
				}
			}
		}

		// For "new" and no category, use the fetched pools directly
		// For "graduating" and "graduated", slice the accumulated pools
		const paginatedPools = category === "new" || !category 
			? allPools 
			: allPools.slice(0, pageSize)

		const processedPools = await Promise.all(
			paginatedPools.map(async (pool) => {
				const processedPool: any = {
					...pool,
					isProtected: !!pool.publicKey,
				}

				// try to get cached market data, metadata, and creator data
				const marketCacheKey = `${CACHE_PREFIX.MARKET_DATA}${pool.poolId}`
				const metadataCacheKey = `${CACHE_PREFIX.COIN_METADATA}${pool.poolId}`
				const creatorCacheKey = `${CACHE_PREFIX.CREATOR_DATA}${pool.creatorAddress}`

				const [cachedMarketData, cachedMetadata, cachedCreatorData] = await Promise.all([
					redisGet(marketCacheKey),
					redisGet(metadataCacheKey),
					redisGet(creatorCacheKey)
				])

				if (cachedMarketData) {
					try {
						const parsedMarketData = JSON.parse(cachedMarketData)
						processedPool.marketData = parsedMarketData

						// use cached mostLiquidPoolId if available
						if (parsedMarketData.mostLiquidPoolId) {
							processedPool.mostLiquidPoolId = parsedMarketData.mostLiquidPoolId
						}
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

				if (cachedCreatorData) {
					try {
						processedPool.creatorData = JSON.parse(cachedCreatorData)
					} catch (error) {
						console.error(`Failed to parse cached creator data for ${pool.creatorAddress}:`, error)
					}
				}

				// if no cached data, fetch from nexa
				if (!processedPool.marketData) {
					try {
						const marketData = await nexaServerClient.getMarketData(pool.coinType)

						// extract coinMetadata for separate caching
						const { coinMetadata, ...restMarketData } = marketData

						// find the most liquid pool if migrated
						if (pool.migrated && restMarketData.pools && Array.isArray(restMarketData.pools)) {
							let mostLiquidPool = null
							let highestLiquidity = 0

							for (const p of restMarketData.pools) {
								if (p.liqUsd && p.liqUsd > highestLiquidity) {
									highestLiquidity = p.liqUsd
									mostLiquidPool = p
								}
							}

							if (mostLiquidPool && mostLiquidPool.pool) {
								processedPool.mostLiquidPoolId = mostLiquidPool.pool
							}
						}

						// trim market data to only what we need
						const trimmedMarketData = {
							coinPrice: restMarketData.coinPrice,
							suiPrice: restMarketData.suiPrice,
							isCoinHoneyPot: restMarketData.isCoinHoneyPot,
							totalLiquidityUsd: restMarketData.totalLiquidityUsd,
							liqUsd: restMarketData.totalLiquidityUsd,
							marketCap: restMarketData.marketCap,
							coin24hTradeCount: restMarketData.coin24hTradeCount,
							coin24hTradeVolumeUsd: restMarketData.coin24hTradeVolumeUsd,
							price1DayAgo: restMarketData.price1DayAgo,
							holdersCount: restMarketData.holdersCount,
							mostLiquidPoolId: processedPool.mostLiquidPoolId
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
							const metadataCacheKey = `${CACHE_PREFIX.COIN_METADATA}${pool.poolId}`
							await redisSetEx(
								metadataCacheKey,
								CACHE_TTL.COIN_METADATA,
								JSON.stringify(coinMetadata)
							)
						}
					} catch (error) {
						console.error(`Failed to fetch market data for ${pool.coinType}:`, error)

						// try to get just cached metadata if market data fails
						const metadataCacheKey = `${CACHE_PREFIX.COIN_METADATA}${pool.poolId}`
						const cachedMetadata = await redisGet(metadataCacheKey)
						if (cachedMetadata) {
							try {
								processedPool.coinMetadata = JSON.parse(cachedMetadata)
							} catch (e) {
								console.error(`Failed to parse cached metadata for pool ${pool.poolId}:`, e)
							}
						}
					}
				}

				// fetch creator data if not cached
				if (!processedPool.creatorData) {
					try {
						const hideIdentity = pool.metadata?.hideIdentity || false
						const twitterHandle = pool.metadata?.CreatorTwitterName ||
							pool.metadata?.creatorTwitter ||
							null

						processedPool.creatorData = await fetchCreatorData(
							pool.creatorAddress,
							twitterHandle,
							hideIdentity
						)
					} catch (error) {
						console.error(`Failed to fetch creator data for ${pool.creatorAddress}:`, error)
					}
				}

				return processedPool
			})
		)

		return NextResponse.json({
			pools: processedPools,
			total: allPools.length,
			page,
			pageSize
		})
	} catch (error: any) {
		console.error("Error fetching tokens:", error)
		console.log(error)
		return NextResponse.json(
			{ error: "Failed to fetch tokens" },
			{ status: 500 }
		)
	}
}