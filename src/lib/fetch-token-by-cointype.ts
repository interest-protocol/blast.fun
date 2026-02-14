"use server"

import { apolloClient } from "@/lib/apollo-client"
import { CONFIG_KEYS } from "@interest-protocol/memez-fun-sdk"
import { redisGet, redisSetEx, CACHE_PREFIX, CACHE_TTL } from "@/lib/redis/client"
import { fetchCreatorData } from "@/lib/fetch-creator-data"
import { fetchNoodlesCoinDetail, fetchNoodlesMarketData } from "@/lib/noodles/client"
import { BASE_DOMAIN } from "@/constants"
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
		const noodlesToken = await buildTokenFromNoodles(decodedCoinType)
		return noodlesToken
	}

	if (!data?.coinPool) {
		const noodlesToken = await buildTokenFromNoodles(decodedCoinType)
		return noodlesToken
	}

	try {
		type PoolMetadata = {
			Website?: string
			X?: string
			Telegram?: string
			Discord?: string
		}
		const pool = data.coinPool as Record<string, unknown> & {
			poolId: string
			coinType: string
			bondingCurve?: number
			metadata?: PoolMetadata
			creatorAddress?: string
			createdAt?: number | string
			treasuryCap?: string
			lastTradeAt?: string
			nsfw?: boolean
			publicKey?: string
			innerState?: string
			burnTax?: number
			coinBalance?: string
			virtualLiquidity?: string
			targetQuoteLiquidity?: string
			quoteBalance?: string
			migrated?: boolean
			curve?: string
			coinIpxTreasuryCap?: string
			canMigrate?: boolean
			canonical?: boolean
			migrationWitness?: string | null
		}

		let marketData: Record<string, unknown> | null = null

		try {
			const mdRes = await fetch(
				`${BASE_DOMAIN}/api/coin/${encodeURIComponent(pool.coinType)}/market-data`,
				{ headers: { Accept: "application/json" }, next: { revalidate: 10 } }
			)
			if (mdRes.ok) {
				marketData = (await mdRes.json()) as Record<string, unknown>
			}
		} catch (error) {
			console.error("Failed to fetch market data:", error)
		}

		const noodlesDetail = await fetchNoodlesCoinDetail(pool.coinType)
		const coin = noodlesDetail?.data?.coin
		const social = noodlesDetail?.data?.social_media ?? {}
		const metadata = {
			name: coin?.name || "",
			symbol: coin?.symbol || "",
			description: coin?.description || "",
			icon_url: coin?.logo || "",
			iconUrl: coin?.logo || "",
			decimals: coin?.decimals ?? 9,
			supply: coin?.total_supply != null ? parseFloat(coin.total_supply) : 0,
			Website: social?.website ?? pool.metadata?.Website,
			X: social?.x ?? pool.metadata?.X,
			Telegram: pool.metadata?.Telegram,
			Discord: social?.discord ?? pool.metadata?.Discord
		}

		const md = marketData as {
			marketCap?: number
			holdersCount?: number
			volume24h?: number
			liquidity?: number
			coinPrice?: number
			coin24hTradeVolumeUsd?: number
			totalLiquidityUsd?: number
			circulating?: number
			price5MinsAgo?: number
			price1HrAgo?: number
			price4HrAgo?: number
			price1DayAgo?: number
		} | null

		const processedPool: Token = {
			id: pool.poolId,
			coinType: pool.coinType,
			treasuryCap: pool.treasuryCap || "",
			poolId: pool.poolId,
			isProtected: !!pool.publicKey,
			metadata: {
				name: metadata.name,
				symbol: metadata.symbol,
				description: metadata.description,
				icon_url: metadata.icon_url || metadata.iconUrl,
				decimals: metadata.decimals,
				supply: metadata.supply,
				Website: metadata.Website,
				X: metadata.X,
				Telegram: metadata.Telegram,
				Discord: metadata.Discord
			},
			creator: {
				address: pool.creatorAddress || "",
				launchCount: 0,
				trustedFollowers: "0",
				followers: "0"
			},
			market: {
				marketCap: md?.marketCap ?? 0,
				holdersCount: md?.holdersCount ?? 0,
				volume24h: md?.volume24h ?? md?.coin24hTradeVolumeUsd ?? 0,
				liquidity: md?.liquidity ?? md?.totalLiquidityUsd ?? 0,
				price: md?.coinPrice ?? 0,
				coinPrice: md?.coinPrice ?? 0,
				bondingProgress: pool.bondingCurve ?? 0,
				circulating: md?.circulating,
				price5MinsAgo: md?.price5MinsAgo,
				price1HrAgo: md?.price1HrAgo,
				price4HrAgo: md?.price4HrAgo,
				price1DayAgo: md?.price1DayAgo
			},
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
				burnTax: pool.burnTax
			},
			createdAt: typeof pool.createdAt === "number" ? pool.createdAt : Number(pool.createdAt ?? Date.now()),
			lastTradeAt: pool.lastTradeAt || new Date().toISOString(),
			nsfw: pool.nsfw
		}

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
		fetchNoodlesMarketData(coinType)
	])
	if (!detailRes?.data?.coin) return null

	const coin = detailRes.data.coin
	const social = detailRes.data.social_media ?? {}
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
		price1DayAgo: marketData?.price1DayAgo
	}

	const token: Token = {
		id: "",
		coinType,
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
			Discord: social?.discord
		},
		creator: {
			address: coin.creator || "",
			launchCount: 0,
			trustedFollowers: "0",
			followers: "0"
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
			migrationWitness: null
		},
		createdAt: coin.published_at ? new Date(coin.published_at).getTime() : Date.now(),
		lastTradeAt: new Date().toISOString(),
		nsfw: false
	}

	return token
}
