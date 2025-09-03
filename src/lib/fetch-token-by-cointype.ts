"use server"

import { apolloClient } from "@/lib/apollo-client"
import { CONFIG_KEYS } from "@interest-protocol/memez-fun-sdk"
import { redisGet, redisSetEx, CACHE_PREFIX, CACHE_TTL } from "@/lib/redis/client"
import { nexaServerClient } from "@/lib/nexa-server"
import { fetchCreatorData } from "@/lib/fetch-creator-data"
import { GET_POOL_BY_COIN_TYPE } from "@/graphql/pools"
import type { PoolWithMetadata } from "@/types/pool"

export async function fetchTokenByCoinType(coinType: string): Promise<PoolWithMetadata | null> {
	try {
		const decodedCoinType = decodeURIComponent(coinType)
		const { data } = await apolloClient.query({
			query: GET_POOL_BY_COIN_TYPE,
			variables: { type: decodedCoinType },
			context: {
				headers: {
					"config-key": CONFIG_KEYS.mainnet.XPUMP
				}
			},
			fetchPolicy: "network-only"
		})

		if (!data?.coinPool) {
			return null
		}

		const pool = data.coinPool
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

		// @dev: fetch market data if not cached
		if (!processedPool.marketData || !processedPool.coinMetadata) {
			try {
				const marketData = await nexaServerClient.getMarketData(pool.coinType)

				const { coinMetadata, ...restMarketData } = marketData

				// @dev: get the most liquid pool if migrated
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

				processedPool.marketData = restMarketData

				if (!processedPool.coinMetadata && coinMetadata) {
					processedPool.coinMetadata = coinMetadata
				}

				await Promise.all([
					redisSetEx(marketCacheKey, CACHE_TTL.MARKET_DATA, JSON.stringify(restMarketData)),
					coinMetadata && redisSetEx(metadataCacheKey, CACHE_TTL.COIN_METADATA, JSON.stringify(coinMetadata))
				])
			} catch (error) {
				console.error("Failed to fetch market data:", error)
			}
		}

		// @dev: fetch creator data if not cached
		if (!processedPool.creatorData && pool.creatorAddress) {
			try {
				const creatorData = await fetchCreatorData({
					creatorAddressOrHandle: pool.creatorAddress,
					poolId: pool.poolId
				})
				if (creatorData) {
					processedPool.creatorData = creatorData
					await redisSetEx(creatorCacheKey, CACHE_TTL.CREATOR_DATA, JSON.stringify(creatorData))
				}
			} catch (error) {
				console.error("Failed to fetch creator data:", error)
			}
		}

		return processedPool
	} catch (error) {
		console.error("Failed to fetch token data:", error)
		return null
	}
}