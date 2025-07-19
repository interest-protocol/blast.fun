import { apolloClient } from "@/lib/apollo-client"
import { GET_RECENT_TRADES } from "@/graphql/trades"

export interface Trade {
	coinAmount: string
	quoteAmount: string
	trader: string
	type: string
	kind: string
	time: string
}

interface RecentTradesData {
	marketTrades: {
		trades: Trade[]
	}
}

/**
 * Fetch recent market trades from GraphQL
 */
export async function fetchRecentTrades(page: number = 1, pageSize: number = 10): Promise<Trade[]> {
	const { data } = await apolloClient.query<RecentTradesData>({
		query: GET_RECENT_TRADES,
		variables: { page, pageSize },
		errorPolicy: "all",
		fetchPolicy: "network-only",
	})

	return data?.marketTrades?.trades ?? []
}
