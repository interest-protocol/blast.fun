import type { PortfolioResponse, PortfolioBalanceItem } from "@/types/portfolio"
import { nexaClient } from "@/lib/nexa"
import { apolloClient } from "@/lib/apollo-client"
import { GET_POOL_BY_COIN_TYPE } from "@/graphql/pools"

export async function fetchPortfolio(address: string): Promise<PortfolioResponse> {
	try {
		const nexaPortfolio = await nexaClient.getPortfolio(address, 0)

		// Map the balances with correct field names from API
		const allBalances: PortfolioBalanceItem[] = nexaPortfolio.balances?.map((item: any) => ({
			coinType: item.coinType,
			balance: item.balance?.toString() || "0",
			price: item.price || 0,
			value: item.value || 0, // API returns 'value' not 'balanceUsd'
			coinMetadata: item.coinMetadata, // API returns 'coinMetadata' not 'metadata'
			marketStats: item.marketStats,
			averageEntryPrice: item.averageEntryPrice || 0,
			unrealizedPnl: item.unrealizedPnl || 0,
		})) || []

		// Filter to only show xpump platform tokens
		const xpumpBalances = allBalances.filter(item => 
			item.coinMetadata?.platform === "xpump"
		)

		// Fetch poolIds for each xpump token using GraphQL
		const balancesWithPoolIds = await Promise.all(
			xpumpBalances.map(async (balance) => {
				try {
					const { data } = await apolloClient.query({
						query: GET_POOL_BY_COIN_TYPE,
						variables: { type: balance.coinType },
						fetchPolicy: 'network-only' // Always fetch fresh data
					})
					
					// Add poolId to coinMetadata
					if (data?.coinPool?.poolId && balance.coinMetadata) {
						balance.coinMetadata.poolId = data.coinPool.poolId
					}
				} catch (error) {
					console.error(`Failed to fetch poolId for ${balance.coinType}:`, error)
					// Continue without poolId if fetch fails
				}
				return balance
			})
		)

		return { balances: balancesWithPoolIds }
	} catch (error) {
		console.error("Failed to fetch portfolio from Nexa:", error)
		throw new Error(`Failed to fetch portfolio: ${error instanceof Error ? error.message : 'Unknown error'}`)
	}
}

export async function fetchCoinBalance(address: string, coinType: string): Promise<string> {
	try {
		const portfolio = await fetchPortfolio(address)
		const coinBalance = portfolio.balances.find(b => b.coinType === coinType)
		return coinBalance?.balance || "0"
	} catch (error) {
		console.error("Failed to fetch coin balance:", error)
		return "0"
	}
}