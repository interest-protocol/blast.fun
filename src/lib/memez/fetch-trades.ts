import {
	fetchNoodlesPoolTradeEventsByProtocols,
} from "@/lib/noodles/client"

export interface Trade {
	coinAmount: string
	quoteAmount: string
	trader: string
	type: string
	kind: string
	time: string
}

export async function fetchRecentTrades(page = 1, pageSize = 10): Promise<Trade[]> {
	const { trades: rawTrades } = await fetchNoodlesPoolTradeEventsByProtocols(pageSize)

	return rawTrades.map((t) => ({
		coinAmount: String(t.amount_a),
		quoteAmount: String(t.amount_b),
		trader: t.sender ?? "",
		type: t.coin_a_type,
		kind: t.a_to_b ? "sell" : "buy",
		time: new Date(t.timestamp).toISOString(),
	}))
}
