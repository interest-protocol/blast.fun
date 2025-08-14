import { apolloClient } from "@/lib/apollo-client"
import { GET_POOL } from "@/graphql/pools"
import { CONFIG_KEYS } from "@interest-protocol/memez-fun-sdk"
import { redisGet, redisSetEx, CACHE_PREFIX, CACHE_TTL } from "@/lib/redis/client"
import { nexaServerClient } from "@/lib/nexa-server"
import { fetchCreatorData } from "@/lib/fetch-creator-data"
import type { PoolWithMetadata } from "@/types/pool"

export async function fetchTokenDataServer(poolId: string): Promise<PoolWithMetadata | null> {
	try {
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
			return null
		}

		const pool = data.pool
		const processedPool: PoolWithMetadata = {
			...pool,
			isProtected: !!pool.publicKey,
		}

		// try to get cached data
		const marketCacheKey = `${CACHE_PREFIX.MARKET_DATA}${pool.coinType}`
		const metadataCacheKey = `${CACHE_PREFIX.COIN_METADATA}${pool.coinType}`
		const creatorCacheKey = `${CACHE_PREFIX.CREATOR_DATA}${pool.creatorAddress}`

		const [cachedMarketData, cachedMetadata, cachedCreatorData] = await Promise.all([
			redisGet(marketCacheKey),
			redisGet(metadataCacheKey),
			redisGet(creatorCacheKey)
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

		if (cachedCreatorData) {
			try {
				processedPool.creatorData = JSON.parse(cachedCreatorData)
			} catch (error) {
				console.error(`Failed to parse cached creator data for ${pool.creatorAddress}:`, error)
			}
		}

		// fetch market data if not cached
		if (!processedPool.marketData || !processedPool.coinMetadata) {
			try {
				const marketData = await nexaServerClient.getMarketData(pool.coinType)

				// extract coinMetadata for separate caching
				const { coinMetadata, ...restMarketData } = marketData

				// trim market data to only what we need
				const trimmedMarketData = {
					coinPrice: restMarketData.coinPrice,
					isCoinHoneyPot: restMarketData.isCoinHoneyPot,
					totalLiquidityUsd: restMarketData.totalLiquidityUsd,
					liqUsd: restMarketData.totalLiquidityUsd,
					marketCap: restMarketData.marketCap,
					coin24hTradeCount: restMarketData.coin24hTradeCount,
					coin24hTradeVolumeUsd: restMarketData.coin24hTradeVolumeUsd,
					price1DayAgo: restMarketData.price1DayAgo,
					holdersCount: restMarketData.holdersCount
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
	} catch (error) {
		console.error("Error fetching token:", error)
		return null
	}
}