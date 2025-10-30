import { GET_MARKET_TRADES } from "@/graphql/trades"
import { apolloClient } from "@/lib/apollo-client"

export interface MarketTrade {
	time: string
	type: "BUY" | "SELL"
	price: string
	volume: string
	trader: string
	kind: string
	quoteAmount: string
	coinAmount: string
	digest: string
}

interface MarketTradesData {
	marketTrades: {
		trades: MarketTrade[]
		total: number
	}
}

interface FetchMarketTradesOptions {
	coinType: string
	page?: number
	pageSize?: number
}

/**
 * Fetch market trades for a specific coin from GraphQL
 */
export async function fetchMarketTrades({
	coinType,
	page = 1,
	pageSize = 50,
}: FetchMarketTradesOptions): Promise<{ trades: MarketTrade[]; total: number }> {
	const { data } = await apolloClient.query<MarketTradesData>({
		query: GET_MARKET_TRADES,
		variables: {
			coinType,
			page,
			pageSize,
		},
		errorPolicy: "all",
		fetchPolicy: "network-only",
	})

	return data?.marketTrades ?? { trades: [], total: 0 }
}