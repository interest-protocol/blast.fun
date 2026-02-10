"use server"

import { apolloClient } from "@/lib/apollo-client"
import { CONFIG_KEYS } from "@interest-protocol/memez-fun-sdk"
import { redisGet, redisSetEx, CACHE_PREFIX, CACHE_TTL } from "@/lib/redis/client"
import { fetchCreatorData } from "@/lib/fetch-creator-data"
import { BASE_DOMAIN } from "@/constants"
import { fetchNoodlesCoinDetail, fetchNoodlesMarketData } from "@/lib/noodles/client"
import { GET_POOL_BY_COIN_TYPE } from "@/graphql/pools"
import type { Token } from "@/types/token"

export async function fetchTokenByCoinType(coinType: string): Promise<Token | null> {
	const decodedCoinType = decodeURIComponent(coinType)
	let data: { coinPool?: unknown } | null = null

	try {
		const result = await apolloClient.query({
			query: GET_POOL_BY_COIN_TYPE,
			variables: { type: decodedCoinType },
			context: {
				headers: {
					"config-key": CONFIG_KEYS.mainnet.XPUMP
				}
			},
			fetchPolicy: "network-only"
		})
		data = result.data
	} catch {
		// @dev: GraphQL throws when pool not found (e.g. Noodles-only tokens); try Noodles fallback.
		const noodlesToken = await buildTokenFromNoodles(decodedCoinType)
		return noodlesToken
	}

	if (!data?.coinPool) {
		const noodlesToken = await buildTokenFromNoodles(decodedCoinType)
		return noodlesToken
	}

	try {
		type PoolMetadata = { Website?: string; X?: string; Telegram?: string; Discord?: string }
		const pool = data.coinPool as Record<string, unknown> & {
			poolId: string; coinType: string; bondingCurve?: number; metadata?: PoolMetadata; creatorAddress?: string; createdAt?: number | string; treasuryCap?: string; lastTradeAt?: string; nsfw?: boolean; publicKey?: string; innerState?: string; burnTax?: number;
			coinBalance?: string; virtualLiquidity?: string; targetQuoteLiquidity?: string; quoteBalance?: string; migrated?: boolean; curve?: string; coinIpxTreasuryCap?: string; canMigrate?: boolean; canonical?: boolean; migrationWitness?: string | null
		}

		// @dev: fetch market data from Nexa to get metadata and market info
		let marketData: any = null
		let metadata: any = pool.metadata || {}
		
		try {
			const mdRes = await fetch(
				`${BASE_DOMAIN}/api/coin/${encodeURIComponent(pool.coinType)}/market-data`,
				{ headers: { Accept: "application/json" }, next: { revalidate: 10 } }
			)
			if (mdRes.ok) {
				marketData = await mdRes.json()
				if ((marketData as any).coinMetadata) {
					metadata = (marketData as any).coinMetadata
				}
			}
		} catch (error) {
			console.error("Failed to fetch market data:", error)
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
				bondingCurve: pool.bondingCurve ?? 0,
				coinBalance: pool.coinBalance ?? "",
				virtualLiquidity: pool.virtualLiquidity ?? "",
				targetQuoteLiquidity: pool.targetQuoteLiquidity ?? "",
				quoteBalance: pool.quoteBalance ?? "",
				migrated: pool.migrated ?? false,
				curve: pool.curve ?? "",
				coinIpxTreasuryCap: pool.coinIpxTreasuryCap ?? "",
				canMigrate: pool.canMigrate ?? false,
				canonical: pool.canonical ?? false,
				migrationWitness: pool.migrationWitness ?? null,
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

async function buildTokenFromNoodles(coinType: string): Promise<Token | null> {
	const [detailRes, marketData] = await Promise.all([
		fetchNoodlesCoinDetail(coinType),
		fetchNoodlesMarketData(coinType),
	])
	if (!detailRes?.data?.coin) return null

	const coin = detailRes.data.coin
	const social = detailRes.data.social_media
	const priceNum = detailRes.data.price_change?.price != null
		? parseFloat(detailRes.data.price_change.price)
		: (marketData?.price ?? 0)
	const marketCap = coin.market_cap != null ? parseFloat(coin.market_cap) : (marketData?.marketCap ?? 0)
	const liquidity = coin.liquidity != null ? parseFloat(coin.liquidity) : (marketData?.liquidity ?? 0)
	const holdersCount = coin.holders ?? marketData?.holdersCount ?? 0
	const volume24h = marketData?.volume24h ?? 0
	const decimals = coin.decimals ?? 9
	const supply = coin.total_supply != null ? parseFloat(coin.total_supply) : 0
	const circulating = coin.circulating_supply != null ? parseFloat(coin.circulating_supply) : 0

	const market = {
		marketCap,
		holdersCount,
		volume24h,
		liquidity,
		price: priceNum,
		coinPrice: priceNum,
		bondingProgress: 0,
		circulating,
		price5MinsAgo: marketData?.price5MinsAgo,
		price1HrAgo: marketData?.price1HrAgo,
		price4HrAgo: marketData?.price4HrAgo,
		price1DayAgo: marketData?.price1DayAgo,
	}

	const token: Token = {
		id: "",
		coinType,
		name: coin.name || "",
		symbol: coin.symbol || "",
		logo: coin.logo || undefined,
		decimals,
		price: priceNum,
		priceChange1d: 0,
		priceChange6h: 0,
		priceChange4h: 0,
		priceChange1h: 0,
		priceChange30m: 0,
		marketCap,
		liquidity,
		circulatingSupply: circulating,
		totalSupply: supply,
		tx24h: 0,
		txBuy24h: 0,
		txSell24h: 0,
		volume24h,
		volume6h: 0,
		volume4h: 0,
		volume1h: 0,
		volume30m: 0,
		holders: holdersCount,
		top10HolderPercent: 0,
		devHoldingPercent: 0,
		createdAt: coin.published_at || String(Date.now()),
		verified: coin.verified ?? false,
		rank: 0,
		treasuryCap: "",
		poolId: "",
		isProtected: false,
		metadata: {
			name: coin.name || "",
			symbol: coin.symbol || "",
			description: coin.description || "",
			icon_url: coin.logo || "",
			decimals,
			supply,
			Website: social?.website,
			X: social?.x,
			Telegram: undefined,
			Discord: social?.discord,
		},
		creator: {
			address: coin.creator || "",
			launchCount: 0,
			trustedFollowers: "0",
			followers: "0",
		},
		market,
		pool: {
			poolId: "",
			coinType,
			bondingCurve: 0,
			coinBalance: "0",
			virtualLiquidity: "0",
			targetQuoteLiquidity: "0",
			quoteBalance: "0",
			migrated: true,
			curve: "",
			coinIpxTreasuryCap: "",
			canMigrate: false,
			canonical: false,
			migrationWitness: null,
			isProtected: false,
		},
		lastTradeAt: new Date().toISOString(),
		nsfw: false,
	}

	return token
}