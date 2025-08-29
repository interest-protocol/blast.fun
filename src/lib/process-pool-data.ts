import { redisGet, redisSetEx, CACHE_PREFIX, CACHE_TTL } from "@/lib/redis/client"
import { nexaServerClient } from "@/lib/nexa-server"
import { fetchCreatorData } from "@/lib/fetch-creator-data"
import { suiClient } from "@/lib/sui-client"
import { prisma } from "@/lib/prisma"
import { blockVisionService } from "@/services/blockvision.service"
import { Pool } from "@/types/pool"

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
export async function processPoolData(pool: Pool): Promise<ProcessedPool> {

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

	// @dev: Don't return cached data if market cap is 0, try to fetch from BlockVision
	if (
		// process.env.NODE_ENV === "development" && 
		processedPool.marketData && processedPool.coinMetadata && processedPool.creatorData
		&& processedPool.marketData.marketCap && processedPool.marketData.marketCap > 0) {
		return processedPool
	}

	try {
		let marketData = await nexaServerClient.getMarketData(pool.coinType)
		
		// @dev: If Nexa returns 0 or missing market cap, try BlockVision as backup
		if (!marketData || !marketData.marketCap || marketData.marketCap === 0) {
			console.log(`Market cap is 0 or missing from Nexa for ${pool.coinType}, trying BlockVision...`)
			try {
				const blockVisionResponse = await blockVisionService.getCoinDetails(pool.coinType)
				if (blockVisionResponse.success && blockVisionResponse.data) {
					const blockVisionData = blockVisionResponse.data
					// @dev: Merge BlockVision data with Nexa data, preferring BlockVision for market cap
					if (marketData) {
						marketData = {
							...marketData,
							marketCap: blockVisionData.marketCap ? parseFloat(blockVisionData.marketCap) : marketData.marketCap,
							coinPrice: blockVisionData.price ? parseFloat(blockVisionData.price) : marketData.coinPrice,
							holdersCount: blockVisionData.holders || marketData.holdersCount,
							coinMetadata: {
								...marketData.coinMetadata,
								name: blockVisionData.name || marketData.coinMetadata?.name,
								symbol: blockVisionData.symbol || marketData.coinMetadata?.symbol,
								decimals: blockVisionData.decimals || marketData.coinMetadata?.decimals,
								iconUrl: blockVisionData.logo || marketData.coinMetadata?.iconUrl,
								verified: blockVisionData.verified,
							}
						}
					} else {
						// @dev: If no Nexa data, create basic MarketData from BlockVision
						marketData = {
							coinPrice: blockVisionData.price ? parseFloat(blockVisionData.price) : 0,
							suiPrice: 0,
							isCoinHoneyPot: false,
							totalLiquidityUsd: 0,
							marketCap: blockVisionData.marketCap ? parseFloat(blockVisionData.marketCap) : 0,
							coin24hTradeCount: 0,
							coin24hTradeVolumeUsd: 0,
							price1DayAgo: 0,
							price5MinsAgo: null,
							price1HrAgo: null,
							price4HrAgo: null,
							holdersCount: blockVisionData.holders || 0,
							coinMetadata: {
								name: blockVisionData.name,
								symbol: blockVisionData.symbol,
								decimals: blockVisionData.decimals,
								iconUrl: blockVisionData.logo,
								verified: blockVisionData.verified,
								coinType: blockVisionData.coinType,
							}
						}
					}
					console.log(`Successfully fetched market cap from BlockVision: ${marketData.marketCap}`)
				}
			} catch (blockVisionError) {
				console.error(`BlockVision fallback failed for ${pool.coinType}:`, blockVisionError)
			}
		}

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
			processedPool.creatorData = await fetchCreatorData({
				poolId: pool.poolId,
				creatorAddressOrHandle: pool.creatorAddress
			})
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