import { redisGet, redisSetEx, CACHE_PREFIX, CACHE_TTL } from "@/lib/redis/client"
import { nexaServerClient } from "@/lib/nexa-server"
import { fetchCreatorData } from "@/lib/fetch-creator-data"
import { suiClient } from "@/lib/sui-client"
import { prisma } from "@/lib/prisma"

export interface ProcessedPool {
	[key: string]: any
	isProtected: boolean
	marketData?: any
	coinMetadata?: any
	creatorData?: any
	mostLiquidPoolId?: string
	protectionSettings?: any
}

/**
 * Process a single pool with all necessary data fetching and caching
 * This function handles:
 * - Market data fetching and caching
 * - Coin metadata fetching and caching
 * - Creator data fetching and caching
 * - Fallback strategies for failed API calls
 */
export async function processPoolData(pool: any): Promise<ProcessedPool> {
	const processedPool: ProcessedPool = {
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

			// @dev: use cached mostLiquidPoolId if available, this is needed for price subbing.
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

			// @dev: only use cache if followers is not "0" (to avoid bad cached data)
			if (parsed.followers !== "0") {
				processedPool.creatorData = parsed
			}
		} catch (error) {
			console.error(`Failed to parse cached creator data for ${pool.creatorAddress}:`, error)
		}
	}

	if (
		// process.env.NODE_ENV === "development" && 
		processedPool.marketData && processedPool.coinMetadata && processedPool.creatorData) {
		return processedPool
	}

	try {
		const marketData = await nexaServerClient.getMarketData(pool.coinType)

		const { coinMetadata, ...restMarketData } = marketData
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

		// @dev: trim market data to only what we need
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
			price5MinsAgo: restMarketData.price5MinsAgo || null,
			price1HrAgo: restMarketData.price1HrAgo || null,
			price4HrAgo: restMarketData.price4HrAgo || null,
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
	}

	// @dev: if still no metadata, fallback to fetching directly from chain
	if (!processedPool.coinMetadata && pool.coinType) {
		try {
			const metadata = await suiClient.getCoinMetadata({ coinType: pool.coinType })
			if (metadata) {
				processedPool.coinMetadata = {
					id: pool.coinType,
					name: metadata.name,
					symbol: metadata.symbol,
					description: metadata.description,
					iconUrl: metadata.iconUrl || undefined,
					decimals: metadata.decimals
				}

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

	if (!processedPool.creatorData) {
		try {
			const twitterHandle = pool.metadata?.CreatorTwitterName || null

			processedPool.creatorData = await fetchCreatorData(
				pool.creatorAddress,
				twitterHandle,
				!twitterHandle
			)
		} catch (error) {
			console.error(`Failed to fetch creator data for ${pool.creatorAddress}:`, error)
		}
	}

	return processedPool
}

/**
 * Process multiple pools in parallel
 */
export async function processMultiplePools(pools: any[]): Promise<ProcessedPool[]> {
	// @dev: Fetch all protection settings for protected pools in one query
	const protectedPoolIds = pools
		.filter(pool => !!pool.publicKey)
		.map(pool => pool.poolId)
	
	const protectionSettingsMap = new Map<string, any>()
	
	if (protectedPoolIds.length > 0) {
		try {
			const protectionSettings = await prisma.tokenProtectionSettings.findMany({
				where: {
					poolId: { in: protectedPoolIds }
				},
				select: {
					poolId: true,
					settings: true
				}
			})
			
			for (const setting of protectionSettings) {
				protectionSettingsMap.set(setting.poolId, setting.settings)
			}
		} catch (error) {
			console.error("Failed to fetch batch protection settings:", error)
		}
	}
	
	// @dev: Process pools in parallel with protection settings
	return Promise.all(pools.map(async (pool) => {
		const processedPool = await processPoolData(pool)
		
		// @dev: Add protection settings from batch fetch if available
		if (pool.publicKey && protectionSettingsMap.has(pool.poolId)) {
			processedPool.protectionSettings = protectionSettingsMap.get(pool.poolId)
		}
		
		return processedPool
	}))
}