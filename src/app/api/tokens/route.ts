import { NextRequest, NextResponse } from "next/server"
import { apolloClient } from "@/lib/apollo-client"
import { GET_POOLS } from "@/graphql/pools"
import { CONFIG_KEYS } from "@interest-protocol/memez-fun-sdk"
import { redisGet, redisSetEx, CACHE_PREFIX, CACHE_TTL } from "@/lib/redis/client"
import { nexaServerClient } from "@/lib/nexa-server"
import { fetchCreatorData } from "@/lib/fetch-creator-data"
import { suiClient } from "@/lib/sui-client"

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams

		const page = Number(searchParams.get("page")) || 1
		const pageSize = Math.min(Number(searchParams.get("pageSize")) || 20, 100)
		const category = searchParams.get("category") as "new" | "graduating" | "graduated" | null
		const sortField = searchParams.get("sortField") || "createdAt"
		const sortDirection = searchParams.get("sortDirection") || "DESC"

		// Check environment
		const isLocalhost = request.headers.get('host')?.includes('localhost') || 
						   request.headers.get('host')?.includes('127.0.0.1') ||
						   process.env.NODE_ENV === 'development'

		// Build filters based on category
		let filters: any = {}

		// Test creator addresses to exclude from graduated tokens
		const testCreatorAddresses = [
			"0xd2420ad33ab5e422becf2fa0e607e1dde978197905b87d070da9ffab819071d6",
			"0xbbf31f4075625942aa967daebcafe0b1c90e6fa9305c9064983b5052ec442ef7",
			"0xd6eb850fdab4143fa973ab119a1b27d5db8744cb8ef7a88125fd33a6ab85b351"
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

		// Always filter out test creator addresses first
		filteredPools = allPools.filter((pool: any) =>
			!testCreatorAddresses.includes(pool.creatorAddress)
		)

		// Then apply category-specific filters
		if (category === "new") {
			// Filter for tokens with bondingCurve < 50
			filteredPools = filteredPools.filter((pool: any) => pool.bondingCurve < 50)
		} else if (category === "graduated") {
			// Already filtered test addresses above, just ensure migrated
			filteredPools = filteredPools.filter((pool: any) => pool.migrated === true)
		}

		const paginatedPools = filteredPools

		const processedPools = await Promise.all(
			paginatedPools.map(async (pool: any) => {
				const processedPool: any = {
					...pool,
					isProtected: !!pool.publicKey,
				}

				// Caching Strategy:
				// - Market data: Redis cache (2 min) for localhost & fallback, plus Vercel edge cache (3s) for production
				// - Metadata & Creator data: Redis cache (12h & 4h respectively) as these are more static
				// This ensures localhost has caching and production has both Redis fallback and edge cache

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
						const parsed = JSON.parse(cachedCreatorData)
						// Only use cache if followers is not "0" (to avoid bad cached data)
						if (parsed.followers !== "0") {
							processedPool.creatorData = parsed
						}
					} catch (error) {
						console.error(`Failed to parse cached creator data for ${pool.creatorAddress}:`, error)
					}
				}

				// For localhost: use Redis cache if available
				// For production: always fetch fresh, fallback to Redis
				if (!isLocalhost || !processedPool.marketData) {
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

					// Cache market data in Redis (2 min TTL)
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
						
						// Nexa failed - use Redis cached data if available
						if (!processedPool.marketData && cachedMarketData) {
							console.log(`Using cached market data for ${pool.coinType} due to Nexa failure`)
							// Already parsed and set above from cachedMarketData
						}

						// Also try to get cached metadata if not already loaded
						if (!processedPool.coinMetadata) {
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
				}
				
				// Final fallback: If still no metadata, fetch directly from blockchain
				if (!processedPool.coinMetadata && pool.coinType) {
					try {
						console.log(`Fetching metadata from blockchain for ${pool.coinType}`)
						const metadata = await suiClient.getCoinMetadata({ coinType: pool.coinType })
						if (metadata) {
							processedPool.coinMetadata = {
								id: pool.coinType, // Use coinType as ID
								name: metadata.name,
								symbol: metadata.symbol,
								description: metadata.description,
								iconUrl: metadata.iconUrl || undefined,
								decimals: metadata.decimals
							}
							
							// Cache it for future use
							const metadataCacheKey = `${CACHE_PREFIX.COIN_METADATA}${pool.poolId}`
							await redisSetEx(
								metadataCacheKey,
								CACHE_TTL.COIN_METADATA,
								JSON.stringify(processedPool.coinMetadata)
							)
						}
					} catch (err) {
						console.error(`Failed to fetch metadata from blockchain for ${pool.coinType}:`, err)
					}
				}


				// For localhost: use cached creator data if available
				// For production: always fetch fresh
				if (!isLocalhost || !processedPool.creatorData) {
					// fetch creator data if not cached or in production
					if (!processedPool.creatorData) {
						try {
							const twitterHandle = pool.metadata?.CreatorTwitterName || null

							processedPool.creatorData = await fetchCreatorData(
								pool.creatorAddress,
								twitterHandle,
								!twitterHandle // hideIdentity should be true when NO twitter handle
							)
						} catch (error) {
							console.error(`Failed to fetch creator data for ${pool.creatorAddress}:`, error)
						}
					}
				}

				return processedPool
			})
		)

		return NextResponse.json(
			{
				pools: processedPools,
				total: filteredPools.length, // Use filtered count instead of total
				page,
				pageSize
			},
			{
				headers: {
					// Vercel Edge Cache: Cache the entire response for 3 seconds
					// This replaces per-pool market data Redis caching for better consistency
					'Cache-Control': 's-maxage=3, stale-while-revalidate'
				}
			}
		)
	} catch (error: any) {
		console.error("Error fetching tokens:", error)
		console.log(error)
		return NextResponse.json(
			{ error: "Failed to fetch tokens" },
			{ status: 500 }
		)
	}
}