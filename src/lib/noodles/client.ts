import type { TokenMarketData, TokenMetadata } from "@/types/token"
import { env } from "@/env"
import {
	NOODLES_API_BASE,
	type NoodlesCoinDetailResponse,
	type NoodlesCoinDetailResponseData,
} from "./types"

const NOODLES_CHAIN = "sui" as const

function noodlesHeaders(): HeadersInit {
	const headers: HeadersInit = {
		Accept: "application/json",
		"Content-Type": "application/json",
		"x-chain": NOODLES_CHAIN,
	}
	const apiKey = env.NOODLES_API_KEY
	if (apiKey) {
		(headers as Record<string, string>)["x-api-key"] = apiKey
	}
	return headers
}

/**
 * Fetch coin detail from Noodles (used for logo and metadata when listing by coin_id).
 */
export async function fetchNoodlesCoinDetail(
	coinId: string
): Promise<NoodlesCoinDetailResponse | null> {
	const apiKey = env.NOODLES_API_KEY
	if (!apiKey) return null

	const url = new URL(`${NOODLES_API_BASE}/api/v1/partner/coin-detail`)
	url.searchParams.set("coin_id", coinId)

	const response = await fetch(url.toString(), {
		headers: noodlesHeaders(),
		next: { revalidate: 60 },
	})

	if (!response.ok) return null
	const data = (await response.json()) as NoodlesCoinDetailResponse
	return data
}

interface NoodlesCoinPriceVolumeResponse {
	price?: number
	volume_24h?: number
	price_change_24h?: number
	volume_change_24h?: number
}

/**
 * Fetch market data for a single coin from Noodles (coin-detail + coin-price-volume).
 * Replaces Bluefin minified-market-data for farms and token detail.
 */
export async function fetchNoodlesMarketData(
	coinId: string
): Promise<TokenMarketData | null> {
	const apiKey = env.NOODLES_API_KEY
	if (!apiKey) return null

	const [detailRes, priceVolumeRes] = await Promise.all([
		fetch(
			`${NOODLES_API_BASE}/api/v1/partner/coin-detail?coin_id=${encodeURIComponent(coinId)}`,
			{
				headers: noodlesHeaders(),
				next: { revalidate: 10 },
			}
		),
		fetch(
			`${NOODLES_API_BASE}/api/v1/partner/coin-price-volume?coin_id=${encodeURIComponent(coinId)}`,
			{
				headers: noodlesHeaders(),
				next: { revalidate: 10 },
			}
		),
	])

	if (!detailRes.ok) return null

	const detailJson = (await detailRes.json()) as NoodlesCoinDetailResponse
	const data = detailJson?.data as NoodlesCoinDetailResponseData | undefined
	if (!data?.coin) return null

	const coin = data.coin
	const priceChange = data.price_change
	const priceNum = priceChange?.price != null ? parseFloat(priceChange.price) : 0
	const marketCap = coin.market_cap != null ? parseFloat(coin.market_cap) : 0
	const liquidity = coin.liquidity != null ? parseFloat(coin.liquidity) : 0
	const holdersCount = coin.holders ?? 0

	let volume24h = 0
	if (priceVolumeRes.ok) {
		try {
			const pv = (await priceVolumeRes.json()) as NoodlesCoinPriceVolumeResponse
			volume24h = pv?.volume_24h ?? 0
		} catch {
			// keep volume24h 0
		}
	}

	const out: TokenMarketData = {
		marketCap,
		holdersCount,
		volume24h,
		liquidity,
		price: priceNum,
		coinPrice: priceNum,
		bondingProgress: 0,
	}
	if (coin.circulating_supply != null) {
		out.circulating = parseFloat(coin.circulating_supply)
	}
	if (priceChange?.price_change_1h != null) out.price1HrAgo = priceChange.price_change_1h
	if (priceChange?.price_change_6h != null) out.price4HrAgo = priceChange.price_change_6h
	if (priceChange?.price_change_1d != null) out.price1DayAgo = priceChange.price_change_1d

	return out
}

/**
 * Fetch coin metadata from Noodles coin-detail, mapped to TokenMetadata.
 */
export async function fetchNoodlesCoinMetadata(
	coinId: string
): Promise<TokenMetadata | null> {
	const detail = await fetchNoodlesCoinDetail(coinId)
	const data = detail?.data
	if (!data?.coin) return null

	const coin = data.coin
	const social = data.social_media ?? {}
	const supply = coin.total_supply != null ? parseFloat(coin.total_supply) : 0

	const out: TokenMetadata = {
		name: coin.name ?? "",
		symbol: coin.symbol ?? "",
		description: coin.description ?? "",
		icon_url: coin.logo ?? "",
		decimals: coin.decimals ?? 9,
		supply,
		Website: social.website,
		X: social.x,
		Discord: social.discord,
	}
	return out
}

export interface NoodlesPortfolioCoin {
	coin_type: string
	symbol: string
	decimals: number
	icon_url?: string | null
	amount: number
	usd_value: number
	verified: boolean
	price: number
	pnl_today?: number | null
	pnl_percent_today?: number | null
	price_change_1d?: number | null
	price_change_7d?: number | null
	price_change_30d?: number | null
}

export interface NoodlesPortfolioResponse {
	code?: number
	message?: string
	data?: NoodlesPortfolioCoin[]
}

/**
 * Fetch portfolio (coin holdings) from Noodles GET /api/v1/partner/portfolio/coins.
 */
export async function fetchNoodlesPortfolio(
	address: string
): Promise<NoodlesPortfolioResponse | null> {
	const apiKey = env.NOODLES_API_KEY
	if (!apiKey) return null

	const url = new URL(`${NOODLES_API_BASE}/api/v1/partner/portfolio/coins`)
	url.searchParams.set("address", address)

	const response = await fetch(url.toString(), {
		headers: noodlesHeaders(),
		next: { revalidate: 30 },
	})

	if (!response.ok) return null
	const json = (await response.json()) as NoodlesPortfolioResponse
	return json
}

export interface NoodlesGlobalSearchCoin {
	coin_type: string
	name: string
	symbol: string
	logo: string
	verified: boolean
	volume_24h?: number
	volume_change_24h?: number
	price?: number
	price_change_1d?: number
	liquidity?: number
	market_cap?: number
}

export interface NoodlesGlobalSearchResponse {
	code?: number
	message?: string
	data?: {
		coin?: NoodlesGlobalSearchCoin[]
		wallet?: unknown[]
		liquidity_pool?: unknown[]
	}
}

/**
 * Search coins via Noodles GET /api/v1/partner/global-search?keyword=...&scope=coin.
 */
export async function fetchNoodlesSearchTokens(
	keyword: string
): Promise<Array<{ coinType: string; symbol: string; name: string; icon?: string; decimals?: number }>> {
	const apiKey = env.NOODLES_API_KEY
	if (!apiKey || !keyword.trim()) return []

	const url = new URL(`${NOODLES_API_BASE}/api/v1/partner/global-search`)
	url.searchParams.set("keyword", keyword.trim())
	url.searchParams.set("scope", "coin")
	url.searchParams.set("limit", "20")

	const response = await fetch(url.toString(), {
		headers: noodlesHeaders(),
		next: { revalidate: 60 },
	})

	if (!response.ok) return []

	const json = (await response.json()) as NoodlesGlobalSearchResponse
	const coins = json?.data?.coin ?? []
	return coins.map((c) => ({
		coinType: c.coin_type,
		symbol: c.symbol,
		name: c.name,
		icon: c.logo,
		decimals: 9,
	}))
}
