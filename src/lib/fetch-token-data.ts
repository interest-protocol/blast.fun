"use server"

import { apolloClient } from "@/lib/apollo-client"
import { GET_POOL } from "@/graphql/pools"
import { CONFIG_KEYS } from "@interest-protocol/memez-fun-sdk"
import { redisGet, redisSetEx, CACHE_PREFIX, CACHE_TTL } from "@/lib/redis/client"
import { nexaServerClient } from "@/lib/nexa-server"
import { fetchCreatorData } from "@/lib/fetch-creator-data"
import { isValidSuiObjectId } from "@mysten/sui/utils"
import type { PoolWithMetadata } from "@/types/pool"

export async function fetchTokenData(poolId: string): Promise<PoolWithMetadata | null> {
	try {
		if (!isValidSuiObjectId(poolId)) {
			return null
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
			return null
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

				if (parsedMarketData.mostLiquidPoolId) {
					processedPool.mostLiquidPoolId = parsedMarketData.mostLiquidPoolId
				}
			} catch (error) {
				console.error(`Failed to parse cached market data for pool ${pool.poolId}:`, error)
			}
		}

		if (cachedMetadata) {
			try {
				processedPool.coinMetadata = JSON.parse(cachedMetadata)
			} catch (error) {
				console.error(`Failed to parse cached metadata for pool ${pool.poolId}:`, error)
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
				console.error(`Failed to fetch market data for pool ${pool.poolId}:`, error)
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