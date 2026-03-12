"use server"

import { redisGet, redisSetEx, CACHE_PREFIX, CACHE_TTL } from "@/lib/redis/client"
import { fetchCreatorData } from "@/lib/fetch-creator-data"
import {
	fetchNoodlesCoinDetail,
	fetchNoodlesMarketData,
	fetchNoodlesCoinLiquidity,
	fetchNoodlesCoinList,
} from "@/lib/noodles/client"
import { BASE_DOMAIN } from "@/constants"
import type { Token } from "@/types/token"

export async function fetchTokenByCoinType(coinType: string): Promise<Token | null> {
	const decodedCoinType = decodeURIComponent(coinType)
	return buildTokenFromNoodles(decodedCoinType)
}

async function buildTokenFromNoodles(coinType: string): Promise<Token | null> {
	const [detailRes, marketData, poolId, coinListRes] = await Promise.all([
		fetchNoodlesCoinDetail(coinType),
		fetchNoodlesMarketData(coinType),
		fetchNoodlesCoinLiquidity(coinType),
		fetchNoodlesCoinList({
			filters: { coinIds: [coinType] },
			pagination: { limit: 1 },
		}),
	])
	if (!detailRes?.data?.coin) return null

	const coin = detailRes.data.coin
	const social = detailRes.data.social_media ?? {}
	const coinListItem = coinListRes?.data?.[0]

	const priceNum =
		detailRes.data.price_change?.price != null
			? parseFloat(detailRes.data.price_change.price)
			: (marketData?.price ?? 0)
	const marketCap = coin.market_cap != null ? parseFloat(coin.market_cap) : (marketData?.marketCap ?? 0)
	const liquidity = coin.liquidity != null ? parseFloat(coin.liquidity) : (marketData?.liquidity ?? 0)
	const holdersCount = coin.holders ?? marketData?.holdersCount ?? 0
	const volume24h = marketData?.volume24h ?? 0
	const decimals = coin.decimals ?? 9
	const supply = coin.total_supply != null ? parseFloat(coin.total_supply) : 0
	const circulating = coin.circulating_supply != null ? parseFloat(coin.circulating_supply) : 0
	const bondingProgress = coinListItem?.bondingCurveProgress ?? 0
	const resolvedPoolId = coinListItem?.bondingCurvePoolId ?? poolId ?? ""

	let additionalMarketData: Record<string, unknown> | null = null
	try {
		const mdRes = await fetch(
			`${BASE_DOMAIN}/api/coin/${encodeURIComponent(coinType)}/market-data`,
			{ headers: { Accept: "application/json" }, next: { revalidate: 10 } }
		)
		if (mdRes.ok) {
			additionalMarketData = (await mdRes.json()) as Record<string, unknown>
		}
	} catch {
		// @dev: continue without additional market data
	}

	const md = additionalMarketData as {
		price5MinsAgo?: number
		price1HrAgo?: number
		price4HrAgo?: number
		price1DayAgo?: number
	} | null

	const market = {
		marketCap,
		holdersCount,
		volume24h,
		liquidity,
		price: priceNum,
		coinPrice: priceNum,
		bondingProgress,
		circulating,
		price5MinsAgo: md?.price5MinsAgo ?? marketData?.price5MinsAgo,
		price1HrAgo: md?.price1HrAgo ?? marketData?.price1HrAgo,
		price4HrAgo: md?.price4HrAgo ?? marketData?.price4HrAgo,
		price1DayAgo: md?.price1DayAgo ?? marketData?.price1DayAgo,
	}

	const isProtected = coinListItem?.isAntiSniper ?? false

	const token: Token = {
		id: resolvedPoolId,
		coinType,
		treasuryCap: "",
		poolId: resolvedPoolId,
		isProtected,
		metadata: {
			name: coin.name || "",
			symbol: coin.symbol || "",
			description: coin.description || "",
			icon_url: coin.logo || "",
			decimals,
			supply,
			Website: social?.website,
			X: social?.x,
			Discord: social?.discord,
		},
		creator: {
			address: coin.creator || coinListItem?.dev || "",
			launchCount: 0,
			trustedFollowers: "0",
			followers: "0",
		},
		market,
		pool: {
			poolId: resolvedPoolId,
			coinType,
			bondingCurve: bondingProgress,
			coinBalance: "0",
			virtualLiquidity: "0",
			targetQuoteLiquidity: "0",
			quoteBalance: "0",
			migrated: coinListItem?.graduatedTime != null,
			curve: "",
			coinIpxTreasuryCap: "",
			canMigrate: false,
			canonical: false,
			migrationWitness: null,
		},
		createdAt: coin.published_at ? new Date(coin.published_at).getTime() : Date.now(),
		lastTradeAt: new Date().toISOString(),
		nsfw: false,
	}

	const creatorAddress = token.creator.address
	if (creatorAddress) {
		const creatorCacheKey = `${CACHE_PREFIX.CREATOR_DATA}${creatorAddress}`
		const cachedCreatorData = await redisGet(creatorCacheKey)

		if (cachedCreatorData) {
			try {
				token.creator = JSON.parse(cachedCreatorData)
			} catch {
				// @dev: continue with default creator data
			}
		} else {
			try {
				const creatorData = await fetchCreatorData({
					creatorAddressOrHandle: creatorAddress,
					poolId: resolvedPoolId,
				})
				if (creatorData) {
					token.creator = creatorData
					await redisSetEx(creatorCacheKey, CACHE_TTL.CREATOR_DATA, JSON.stringify(creatorData))
				}
			} catch {
				// @dev: continue with default creator data
			}
		}
	}

	return token
}
