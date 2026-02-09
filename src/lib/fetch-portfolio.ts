import type { PortfolioResponse, PortfolioBalanceItem } from "@/types/portfolio"
import { nexaClient } from "@/lib/nexa"
import { apolloClient } from "@/lib/apollo-client"
import { GET_POOL_BY_COIN_TYPE } from "@/graphql/pools"

export async function fetchPortfolio(address: string): Promise<PortfolioResponse> {
	try {
		const nexaPortfolio = await nexaClient.getPortfolio(address, 0)

		if (!nexaPortfolio || !nexaPortfolio.balances) {
			return { balances: [] }
		}

		// Map the balances with correct field names from API
		const rawBalances = nexaPortfolio.balances as Array<Record<string, unknown>>
		const allBalances: PortfolioBalanceItem[] = rawBalances.map((item) => ({
			coinType: (item.coinType as string) ?? "",
			balance: item.balance != null ? String(item.balance) : "0",
			price: Number(item.price) || 0,
			value: Number(item.value) || 0,
			coinMetadata: item.coinMetadata as PortfolioBalanceItem["coinMetadata"],
			marketStats: item.marketStats as PortfolioBalanceItem["marketStats"],
			averageEntryPrice: Number(item.averageEntryPrice) || 0,
			unrealizedPnl: Number(item.unrealizedPnl) || 0,
		}))

		// Filter to show xpump platform tokens or items without platform (e.g. from Noodles)
		const xpumpBalances = allBalances.filter(
			(item) =>
				item.coinMetadata?.platform === "xpump" ||
				item.coinMetadata?.platform === undefined
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