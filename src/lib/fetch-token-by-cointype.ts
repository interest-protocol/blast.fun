"use server"

import { apolloClient } from "@/lib/apollo-client"
import { CONFIG_KEYS } from "@interest-protocol/memez-fun-sdk"
import { redisGet, redisSetEx, CACHE_PREFIX, CACHE_TTL } from "@/lib/redis/client"
import { fetchCreatorData } from "@/lib/fetch-creator-data"
import { nexaServerClient } from "@/lib/nexa-server"
import { GET_POOL_BY_COIN_TYPE } from "@/graphql/pools"
import type { Token } from "@/types/token"

export async function fetchTokenByCoinType(coinType: string): Promise<Token | null> {
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
		
		// @dev: fetch market data from Nexa to get metadata and market info
		let marketData: any = null
		let metadata: any = pool.metadata || {}
		
		try {
			marketData = await nexaServerClient.getMarketData(pool.coinType)
			if ((marketData as any)?.coinMetadata) {
				metadata = (marketData as any).coinMetadata
			}
		} catch (error) {
			console.error("Failed to fetch market data from Nexa:", error)
		}
		
		// @dev: find most liquid pool for migrated tokens
		let mostLiquidPoolId = (marketData as any)?.mostLiquidPoolId
		if (pool.migrated && (marketData as any)?.pools && Array.isArray((marketData as any).pools)) {
			const pools = (marketData as any).pools
			const mostLiquid = pools.reduce((max: any, p: any) => 
				(p.liqUsd > (max?.liqUsd || 0)) ? p : max, null)
			if (mostLiquid?.pool) {
				mostLiquidPoolId = mostLiquid.pool
			}
		}
		
		const market = {
			marketCap: (marketData as { marketCap?: number })?.marketCap || 0,
			holdersCount: (marketData as { holdersCount?: number })?.holdersCount || 0,
			volume24h: (marketData as { coin24hTradeVolumeUsd?: number })?.coin24hTradeVolumeUsd || 0,
			liquidity: (marketData as { totalLiquidityUsd?: number })?.totalLiquidityUsd || 0,
			price: (marketData as { coinPrice?: number })?.coinPrice || 0,
			coinPrice: (marketData as { coinPrice?: number })?.coinPrice || 0,
			bondingProgress: pool.bondingCurve || 0,
			circulating: (marketData as { coinSupply?: number })?.coinSupply,
			price5MinsAgo: (marketData as { price5MinsAgo?: number })?.price5MinsAgo,
			price1HrAgo: (marketData as { price1HrAgo?: number })?.price1HrAgo,
			price4HrAgo: (marketData as { price4HrAgo?: number })?.price4HrAgo,
			price1DayAgo: (marketData as { price1DayAgo?: number })?.price1DayAgo
		}

		// @dev: construct token object with data from gql + nexa (flat Token fields + nested metadata/market/pool)
		const processedPool: Token = {
			id: pool.poolId,
			coinType: pool.coinType,
			name: metadata.name || "",
			symbol: metadata.symbol || "",
			logo: metadata.icon_url || metadata.iconUrl || "",
			decimals: metadata.decimals ?? 9,
			price: market.price,
			priceChange1d: 0,
			priceChange6h: 0,
			priceChange4h: 0,
			priceChange1h: 0,
			priceChange30m: 0,
			marketCap: market.marketCap,
			liquidity: market.liquidity,
			circulatingSupply: market.circulating ?? 0,
			totalSupply: metadata.supply ?? 0,
			tx24h: 0,
			txBuy24h: 0,
			txSell24h: 0,
			volume24h: market.volume24h,
			volume6h: 0,
			volume4h: 0,
			volume1h: 0,
			volume30m: 0,
			holders: market.holdersCount,
			top10HolderPercent: 0,
			devHoldingPercent: 0,
			createdAt: typeof pool.createdAt === "number" ? String(pool.createdAt) : (pool.createdAt ?? String(Date.now())),
			verified: false,
			rank: 0,
			treasuryCap: pool.treasuryCap || "",
			poolId: pool.poolId,
			isProtected: !!pool.publicKey,
			metadata: {
				name: metadata.name || "",
				symbol: metadata.symbol || "",
				description: metadata.description || "",
				icon_url: metadata.icon_url || metadata.iconUrl || "",
				decimals: metadata.decimals ?? 9,
				supply: metadata.supply ?? 0,
				Website: pool.metadata?.Website,
				X: pool.metadata?.X,
				Telegram: pool.metadata?.Telegram,
				Discord: pool.metadata?.Discord
			},
			creator: {
				address: pool.creatorAddress || "",
				launchCount: 0,
				trustedFollowers: "0",
				followers: "0"
			},
			market,
			pool: {
				poolId: pool.poolId,
				coinType: pool.coinType,
				bondingCurve: pool.bondingCurve,
				coinBalance: pool.coinBalance,
				virtualLiquidity: pool.virtualLiquidity,
				targetQuoteLiquidity: pool.targetQuoteLiquidity,
				quoteBalance: pool.quoteBalance,
				migrated: pool.migrated,
				curve: pool.curve,
				coinIpxTreasuryCap: pool.coinIpxTreasuryCap,
				canMigrate: pool.canMigrate,
				canonical: pool.canonical,
				migrationWitness: pool.migrationWitness,
				isProtected: !!pool.publicKey,
				publicKey: pool.publicKey,
				burnTax: pool.burnTax,
				mostLiquidPoolId: mostLiquidPoolId
			},
			lastTradeAt: pool.lastTradeAt || new Date().toISOString(),
			nsfw: pool.nsfw
		}

		// @dev: fetch creator data if we have a creator address
		if (pool.creatorAddress) {
			const creatorCacheKey = `${CACHE_PREFIX.CREATOR_DATA}${pool.creatorAddress}`
			const cachedCreatorData = await redisGet(creatorCacheKey)
			
			if (cachedCreatorData) {
				try {
					processedPool.creator = JSON.parse(cachedCreatorData)
				} catch (error) {
					console.error(`Failed to parse cached creator data for ${pool.creatorAddress}:`, error)
				}
			} else {
				try {
					const creatorData = await fetchCreatorData({
						creatorAddressOrHandle: pool.creatorAddress,
						poolId: pool.poolId
					})
					if (creatorData) {
						processedPool.creator = creatorData
						await redisSetEx(creatorCacheKey, CACHE_TTL.CREATOR_DATA, JSON.stringify(creatorData))
					}
				} catch (error) {
					console.error("Failed to fetch creator data:", error)
				}
			}
		}

		return processedPool
	} catch (error) {
		console.error("Failed to fetch token data:", error)
		return null
	}
}