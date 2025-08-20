import { NextRequest, NextResponse } from "next/server"
import { apolloClient } from "@/lib/apollo-client"
import { GET_POOL } from "@/graphql/pools"
import { CONFIG_KEYS } from "@interest-protocol/memez-fun-sdk"
import { redisGet, redisSetEx, CACHE_PREFIX, CACHE_TTL } from "@/lib/redis/client"
import { nexaServerClient } from "@/lib/nexa-server"
import { fetchCreatorData } from "@/lib/fetch-creator-data"
import { isValidSuiObjectId } from "@mysten/sui/utils"
import type { PoolWithMetadata } from "@/types/pool"
import { suiClient } from "@/lib/sui-client"

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id: poolId } = await params
		if (!isValidSuiObjectId(poolId)) {
			return NextResponse.json(
				{ error: "Invalid token ID" },
				{ status: 400 }
			)
		}

		const { data } = await apolloClient.query({
			query: GET_POOL,
			variables: { poolId },
			context: {
				headers: {
					"config-key": CONFIG_KEYS.mainnet.XPUMP
				}
			},
			fetchPolicy: "network-only"
		})

		if (!data?.pool) {
			return NextResponse.json(
				{ error: "Token not found" },
				{ status: 404 }
			)
		}

		const pool = data.pool
		const processedPool: PoolWithMetadata = {
			...pool,
			isProtected: !!pool.publicKey,
		}

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

		// Always try to fetch fresh market data from Nexa
		// Fall back to Redis cache if it fails
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

				await Promise.all([
					redisSetEx(
						marketCacheKey,
						CACHE_TTL.MARKET_DATA,
						JSON.stringify(trimmedMarketData)
					),
					coinMetadata && redisSetEx(
						metadataCacheKey,
						CACHE_TTL.COIN_METADATA,
						JSON.stringify(coinMetadata)
					)
				])
		} catch (error) {
			console.error(`Failed to fetch market data for ${pool.coinType}:`, error)
			
			// Nexa failed - use Redis cached data if available
			if (!processedPool.marketData && cachedMarketData) {
				console.log(`Using cached market data for ${pool.coinType} due to Nexa failure`)
				// Already parsed and set above from cachedMarketData
			}
			
			// Also try to get cached metadata if not already loaded
			if (!processedPool.coinMetadata && cachedMetadata) {
				console.log(`Using cached metadata for ${pool.coinType} due to Nexa failure`)
				// Already parsed and set above from cachedMetadata
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

		// fetch creator data if not cached
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

		// Check environment for response
		const isLocalhost = request.headers.get('host')?.includes('localhost') || 
						   request.headers.get('host')?.includes('127.0.0.1') ||
						   process.env.NODE_ENV === 'development'
		
		if (isLocalhost) {
			// For localhost: return without cache headers
			return NextResponse.json(processedPool)
		} else {
			// For production: return with Vercel Edge Cache headers
			return NextResponse.json(
				processedPool,
				{
					headers: {
						// Vercel Edge Cache: Cache for 3 seconds with stale-while-revalidate
						'Cache-Control': 's-maxage=3, stale-while-revalidate'
					}
				}
			)
		}
	} catch (error) {
		console.error("Error fetching token:", error)
		return NextResponse.json(
			{ error: "Failed to fetch token data" },
			{ status: 500 }
		)
	}
}