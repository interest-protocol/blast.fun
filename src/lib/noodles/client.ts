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

interface NoodlesCoinPriceVolumeResponse {
	price?: number
	volume_24h?: number
	price_change_24h?: number
	volume_change_24h?: number
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
	if (priceChange?.price_change_1d != null)
		out.price1DayAgo = priceChange.price_change_1d

	return out
}
