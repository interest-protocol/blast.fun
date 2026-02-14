import { NextResponse } from "next/server"
import {
	fetchNoodlesCoinLiquidity,
	fetchNoodlesPoolTradeEvents,
	fetchNoodlesPoolTradeEventsByProtocols,
	type NoodlesPoolTradeEvent,
} from "@/lib/noodles/client"

export const dynamic = "force-dynamic"

function mapPoolTradeToMarketTrade(
	t: NoodlesPoolTradeEvent,
	coinType: string
): { time: string; type: "BUY" | "SELL"; price: string; volume: string; trader: string; kind: string; quoteAmount: string; coinAmount: string; digest: string } {
	const isCoinA = t.coin_a_type === coinType
	const isBuy = (isCoinA && !t.a_to_b) || (!isCoinA && t.a_to_b)

	const quoteAmount = isCoinA ? t.amount_b : t.amount_a
	const coinAmount = isCoinA ? t.amount_a : t.amount_b
	const volumeUsd = isCoinA ? t.amount_a_usd : t.amount_b_usd

	return {
		time: new Date(t.timestamp).toISOString(),
		type: isBuy ? "BUY" : "SELL",
		price: String(t.price),
		volume: String(volumeUsd ?? quoteAmount),
		trader: t.sender ?? "",
		kind: isBuy ? "BUY" : "SELL",
		quoteAmount: String(quoteAmount),
		coinAmount: String(coinAmount),
		digest: t.tx_digest ?? "",
	}
}

async function fetchTradesFromNoodles(
	coinType: string,
	limit: number,
	cursorParam: string | null
): Promise<{ trades: ReturnType<typeof mapPoolTradeToMarketTrade>[]; nextCursor: number | null }> {
	const cursor = cursorParam != null ? parseInt(cursorParam, 10) : undefined

	const poolAddress = await fetchNoodlesCoinLiquidity(coinType)
	if (poolAddress) {
		const { trades: rawTrades, nextCursor } = await fetchNoodlesPoolTradeEvents(
			poolAddress,
			limit,
			Number.isNaN(cursor ?? NaN) ? undefined : cursor
		)

		const filtered = rawTrades.filter(
			(t) => t.coin_a_type === coinType || t.coin_b_type === coinType
		)
		if (filtered.length > 0) {
			return {
				trades: filtered.map((t) => mapPoolTradeToMarketTrade(t, coinType)),
				nextCursor,
			}
		}
	}

	const { trades: rawTrades, nextCursor } = await fetchNoodlesPoolTradeEventsByProtocols(
		limit,
		Number.isNaN(cursor ?? NaN) ? undefined : cursor,
		coinType
	)
	return {
		trades: rawTrades.map((t) => mapPoolTradeToMarketTrade(t, coinType)),
		nextCursor,
	}
}

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ coin_type: string }> }
) {
	try {
		const { coin_type } = await params
		const coinType = decodeURIComponent(coin_type)
		const { searchParams } = new URL(_request.url)
		const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10) || 20, 100)
		const cursorParam = searchParams.get("cursor")

		const { trades, nextCursor } = await fetchTradesFromNoodles(
			coinType,
			limit,
			cursorParam
		)

		return NextResponse.json(
			{ trades, nextCursor, total: trades.length },
			{ headers: { "Cache-Control": "public, s-maxage=5, stale-while-revalidate=15" } }
		)
	} catch (error) {
		console.error("Error fetching trades:", error)
		return NextResponse.json({ trades: [], total: 0, nextCursor: null }, { status: 200 })
	}
}
