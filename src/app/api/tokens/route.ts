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

		// Build filters based on category
		let filters: any = {}
		
		// Test creator addresses to exclude from graduated tokens
		const testCreatorAddresses = [
			"0xd2420ad33ab5e422becf2fa0e607e1dde978197905b87d070da9ffab819071d6",
			"0xbbf31f4075625942aa967daebcafe0b1c90e6fa9305c9064983b5052ec442ef7"
		]
		
		switch (category) {
			case "graduating":
				filters = {
					migrated: false,
					minBondingCurve: 50
				}
				break
			case "graduated":
				// Can't exclude addresses via GraphQL filter, will handle in backend
				filters = {
					migrated: true
				}
				break
			case "new":
				// Can't use maxBondingCurve in GraphQL, will filter in backend
				filters = {
					migrated: false
				}
				break
			default:
				// No filter for all pools
				break
		}

		// Single query with filters
		const { data } = await apolloClient.query({
			query: GET_POOLS,
			variables: {
				page: page,
				pageSize: pageSize,
				sortField: sortField,
				sortDirection: sortDirection,
				filters: Object.keys(filters).length > 0 ? filters : undefined
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

		const allPools = data.pools.pools
		const totalPoolsCount = data.pools.total

		// Apply additional filtering for categories that GraphQL doesn't support
		let filteredPools = allPools
		
		if (category === "new") {
			// Filter for tokens with bondingCurve < 50
			filteredPools = allPools.filter(pool => pool.bondingCurve < 50)
		} else if (category === "graduated") {
			// Filter out test creator addresses
			filteredPools = allPools.filter(pool => 
				!testCreatorAddresses.includes(pool.creatorAddress)
			)
		}
		
		const paginatedPools = filteredPools

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
			total: filteredPools.length, // Use filtered count instead of total
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