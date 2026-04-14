import {
	fetchNoodlesCoinLiquidity,
	fetchNoodlesPoolTradeEvents,
	fetchNoodlesPoolTradeEventsByProtocols,
	type NoodlesPoolTradeEvent,
} from "@/lib/noodles/client";

export interface MarketTrade {
	time: string;
	type: "BUY" | "SELL";
	price: string;
	volume: string;
	trader: string;
	kind: string;
	quoteAmount: string;
	coinAmount: string;
	digest: string;
}

interface FetchMarketTradesOptions {
	coinType: string;
	page?: number;
	pageSize?: number;
}

function mapNoodlesTradeToMarketTrade(t: NoodlesPoolTradeEvent, coinType: string): MarketTrade {
	const isCoinA = t.coin_a_type === coinType;
	const isBuy = (isCoinA && !t.a_to_b) || (!isCoinA && t.a_to_b);

	const quoteAmount = isCoinA ? t.amount_b : t.amount_a;
	const coinAmount = isCoinA ? t.amount_a : t.amount_b;
	const volumeUsd = isCoinA ? t.amount_a_usd : t.amount_b_usd;

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
	};
}

export async function fetchMarketTrades({
	coinType,
	pageSize = 50,
}: FetchMarketTradesOptions): Promise<{ trades: MarketTrade[]; total: number }> {
	const poolAddress = await fetchNoodlesCoinLiquidity(coinType);
	if (poolAddress) {
		const { trades: rawTrades } = await fetchNoodlesPoolTradeEvents(poolAddress, pageSize);
		const filtered = rawTrades.filter((t) => t.coin_a_type === coinType || t.coin_b_type === coinType);
		if (filtered.length > 0) {
			return {
				trades: filtered.map((t) => mapNoodlesTradeToMarketTrade(t, coinType)),
				total: filtered.length,
			};
		}
	}

	const { trades: rawTrades } = await fetchNoodlesPoolTradeEventsByProtocols(pageSize, undefined, coinType);
	return {
		trades: rawTrades.map((t) => mapNoodlesTradeToMarketTrade(t, coinType)),
		total: rawTrades.length,
	};
}
