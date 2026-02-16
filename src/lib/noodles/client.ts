import type { TokenMarketData } from "@/types/token"
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
	data?: {
		price?: number
		volume_24h?: number
		price_change_24h?: number
		volume_change_24h?: number
	}
}

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
			volume24h = pv?.data?.volume_24h ?? 0
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
	if (priceChange?.price_change_1d != null)
		out.price1DayAgo = priceChange.price_change_1d

	return out
}

export interface NoodlesCoinLiquidityPool {
	pool_id: string
	protocol: string
	coin_a: string
	coin_b: string
	amount_a: number
	amount_b: number
	amount_a_usd: number
	amount_b_usd: number
	price_a: number
	price_b: number
	tvl_usd: number
	fee_rate?: number
}

export interface NoodlesCoinLiquidityResponse {
	code?: number
	message?: string
	data?: {
		dex_liquidity?: NoodlesCoinLiquidityPool[]
		lending_liquidity?: unknown[]
		coin_info_map?: Record<string, { coin_type: string; symbol: string; decimals?: number; icon_url?: string; verified?: boolean }>
		pagination?: { offset: number; limit: number }
	}
}

export async function fetchNoodlesCoinLiquidity(coinType: string): Promise<string | null> {
	const apiKey = env.NOODLES_API_KEY
	if (!apiKey) return null
	try {
		const url = new URL(`${NOODLES_API_BASE}/api/v1/partner/coin/liquidity`)
		url.searchParams.set("coin_type", coinType)
		url.searchParams.set("pool_type", "dex")
		url.searchParams.set("limit", "10")

		const res = await fetch(url.toString(), {
			headers: noodlesHeaders(),
			next: { revalidate: 60 },
		})
		if (!res.ok) return null
		const json = (await res.json()) as NoodlesCoinLiquidityResponse
		const pools = json?.data?.dex_liquidity ?? []
		const top = [...pools].sort((a, b) => (b.tvl_usd ?? 0) - (a.tvl_usd ?? 0))[0]
		return top?.pool_id ?? null
	} catch {
		return null
	}
}

export interface NoodlesPoolTradeEvent {
	id: number
	timestamp: number
	action: string
	pool_address: string
	coin_a_type: string
	coin_b_type: string
	coin_a_symbol: string
	coin_b_symbol: string
	price: number
	amount_a: number
	amount_b: number
	amount_a_usd: number
	amount_b_usd: number
	a_to_b: boolean
	tx_digest: string
	sender: string
	source?: string | null
}

export interface NoodlesPoolTradeEventResponse {
	code?: number
	message?: string
	data?: NoodlesPoolTradeEvent[]
	pagination?: { last_cursor: number | null; last_timestamp?: number | null; limit?: number }
}

export async function fetchNoodlesPoolTradeEvents(
	poolAddress: string,
	limit: number,
	cursor?: number
): Promise<{ trades: NoodlesPoolTradeEvent[]; nextCursor: number | null }> {
	const apiKey = env.NOODLES_API_KEY
	if (!apiKey) return { trades: [], nextCursor: null }
	try {
		const url = new URL(`${NOODLES_API_BASE}/api/v1/partner/pool/event/trade`)
		url.searchParams.set("pool_address", poolAddress)
		url.searchParams.set("limit", String(limit))
		if (cursor != null) url.searchParams.set("cursor", String(cursor))

		const res = await fetch(url.toString(), {
			headers: noodlesHeaders(),
			next: { revalidate: 5 },
		})
		if (!res.ok) return { trades: [], nextCursor: null }
		const json = (await res.json()) as NoodlesPoolTradeEventResponse
		const trades = json?.data ?? []
		const nextCursor = json?.pagination?.last_cursor ?? null
		return { trades, nextCursor }
	} catch {
		return { trades: [], nextCursor: null }
	}
}

const NOODLES_DEX_PROTOCOLS = "cetus-clmm,aftermath-cpmm,flowx-clmm,flowx-cpmm,bluefin-clmm"

export async function fetchNoodlesPoolTradeEventsByProtocols(
	limit: number,
	cursor?: number,
	coinType?: string
): Promise<{ trades: NoodlesPoolTradeEvent[]; nextCursor: number | null }> {
	const apiKey = env.NOODLES_API_KEY
	if (!apiKey) return { trades: [], nextCursor: null }
	try {
		const url = new URL(`${NOODLES_API_BASE}/api/v1/partner/pool/event/trade`)
		url.searchParams.set("protocols", NOODLES_DEX_PROTOCOLS)
		url.searchParams.set("limit", String(Math.min(limit * 3, 100)))
		if (cursor != null) url.searchParams.set("cursor", String(cursor))

		const res = await fetch(url.toString(), {
			headers: noodlesHeaders(),
			next: { revalidate: 5 },
		})
		if (!res.ok) return { trades: [], nextCursor: null }
		const json = (await res.json()) as NoodlesPoolTradeEventResponse
		const allTrades = json?.data ?? []
		const filtered = coinType
			? allTrades.filter((t) => t.coin_a_type === coinType || t.coin_b_type === coinType)
			: allTrades
		const nextCursor = json?.pagination?.last_cursor ?? null
		return { trades: filtered.slice(0, limit), nextCursor }
	} catch {
		return { trades: [], nextCursor: null }
	}
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
}

export interface NoodlesPortfolioResponse {
	code?: number
	message?: string
	data?: NoodlesPortfolioCoin[]
}

export async function fetchNoodlesPortfolio(
	address: string
): Promise<NoodlesPortfolioResponse | null> {
	const apiKey = env.NOODLES_API_KEY
	if (!apiKey) return null

	const url = new URL(`${NOODLES_API_BASE}/api/v1/partner/portfolio/coins`)
	url.searchParams.set("address", address)

	const response = await fetch(url.toString(), {
		headers: noodlesHeaders(),
		next: { revalidate: 30 }
	})

	if (!response.ok) return null
	const json = (await response.json()) as NoodlesPortfolioResponse
	return json
}
