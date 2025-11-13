"use server"

import { apolloClient } from "@/lib/apollo-client"
import { CONFIG_KEYS } from "@interest-protocol/memez-fun-sdk"
import { redisGet, redisSetEx, CACHE_PREFIX, CACHE_TTL } from "@/lib/redis/client"
import { fetchCreatorData } from "@/lib/fetch-creator-data"
import { nexaServerClient } from "@/lib/nexa-server"
import { GET_POOL_BY_COIN_TYPE } from "@/graphql/pools"
import { MinimalPool, type Token } from "@/types/token"

export async function fetchTokenByCoinType(coinType: string): Promise<Token | null> {
	console.log(`token coin type in: ${coinType}`);

	try {
		const tokenData = await nexaServerClient.getMarketData(coinType);

		// @dev: find most liquid pool for migrated tokens
		let mostLiquidPoolId;
		if (Array.isArray(tokenData.pools)) {
			const pools = tokenData.pools!;

			const mostLiquid = pools.reduce<MinimalPool | undefined>((max, p) => {
				const a = Number(p.liqUsd);
				const b = Number(max?.liqUsd);

				return Number.isFinite(a) && (!Number.isFinite(b) || a > b) ? p : max;
			}, undefined);

			if (mostLiquid?.pool) mostLiquidPoolId = mostLiquid.pool;
		}

		// @dev: fetch creator data for this token
		if (tokenData.coinDev) {
			const tokenCreator = tokenData.coinDev;

			const creatorCacheKey = `${CACHE_PREFIX.CREATOR_DATA}${tokenCreator}`;
			const cachedCreatorData = await redisGet(creatorCacheKey);

			// parse cached data or fetch fresh.
			// const creatorData = await fetchCreatorData({
			// 	creatorAddressOrHandle: pool.creatorAddress,
			// 	poolId: pool.poolId
			// })
		}

		const processedToken: Token = {
			coinType: tokenData.coinMetadata.coinType,
			metadata: {
				coinType: tokenData.coinMetadata.coinType,
				createdAt: tokenData.coinMetadata.createdAt,

				name: tokenData.coinMetadata.name || "",
				symbol: tokenData.coinMetadata.symbol || "",
				description: tokenData.coinMetadata.description || "",
	
				supply: tokenData.coinMetadata.supply || 0,
				decimals: tokenData.coinMetadata.decimals || 9,
				icon_url: tokenData.coinMetadata.icon_url || "",

				telegram: tokenData.coinMetadata.telegram,
				twitter: tokenData.coinMetadata.twitter,
				website: tokenData.coinMetadata.website
			},
			creator: {
				address: tokenData.coinDev || "",
				launchCount: 0,
				trustedFollowers: "0",
				followers: "0"
			},
			market: {
				marketCap: (marketData as any)?.marketCap || 0,
				holdersCount: (marketData as any)?.holdersCount || 0,
				volume24h: (marketData as any)?.coin24hTradeVolumeUsd || 0,
				liquidity: (marketData as any)?.totalLiquidityUsd || 0,
				price: (marketData as any)?.coinPrice || 0,
				coinPrice: (marketData as any)?.coinPrice || 0,
				bondingProgress: pool.bondingCurve || 0,
				circulating: (marketData as any)?.coinSupply,
				price5MinsAgo: (marketData as any)?.price5MinsAgo,
				price1HrAgo: (marketData as any)?.price1HrAgo,
				price4HrAgo: (marketData as any)?.price4HrAgo,
				price1DayAgo: (marketData as any)?.price1DayAgo
			},
			createdAt: tokenData.coinMetadata.createdAt || Date.now(),
		}

	} catch(error) {
		console.error(`Failed to fetch token data for ${coinType}:`, error);
		return null;
	}




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
			if ((marketData as any).coinMetadata) {
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
		
		// @dev: construct token object with data from gql + nexa
		const processedPool: Token = {
			id: pool.poolId,
			coinType: pool.coinType,
			treasuryCap: pool.treasuryCap || "",
			metadata: {
				name: metadata.name || "",
				symbol: metadata.symbol || "",
				description: metadata.description || "",
				icon_url: metadata.icon_url || metadata.iconUrl || "",
				decimals: metadata.decimals || 9,
				supply: metadata.supply || 0,
				Website: pool.metadata?.Website,
				X: pool.metadata?.X,
				Telegram: pool.metadata?.Telegram
			},
			creator: {
				address: pool.creatorAddress || "",
				launchCount: 0,
				trustedFollowers: "0",
				followers: "0"
			},
			market: {
				marketCap: (marketData as any)?.marketCap || 0,
				holdersCount: (marketData as any)?.holdersCount || 0,
				volume24h: (marketData as any)?.coin24hTradeVolumeUsd || 0,
				liquidity: (marketData as any)?.totalLiquidityUsd || 0,
				price: (marketData as any)?.coinPrice || 0,
				coinPrice: (marketData as any)?.coinPrice || 0,
				bondingProgress: pool.bondingCurve || 0,
				circulating: (marketData as any)?.coinSupply,
				price5MinsAgo: (marketData as any)?.price5MinsAgo,
				price1HrAgo: (marketData as any)?.price1HrAgo,
				price4HrAgo: (marketData as any)?.price4HrAgo,
				price1DayAgo: (marketData as any)?.price1DayAgo
			},
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
			createdAt: pool.createdAt || Date.now(),
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