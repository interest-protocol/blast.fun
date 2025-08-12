import type { PortfolioResponse, PortfolioBalanceItem } from "@/types/portfolio"
import { nexaClient } from "@/lib/nexa"

export async function fetchPortfolio(address: string): Promise<PortfolioResponse> {
	try {
		const nexaPortfolio = await nexaClient.getPortfolio(address, 0)

		const balances: PortfolioBalanceItem[] = nexaPortfolio.balances?.map((item: any) => ({
			coinType: item.coinType,
			balance: item.balance?.toString() || "0",
			price: item.price || 0,
			value: item.balanceUsd || 0,
			coinMetadata: item.metadata,
			marketStats: item.marketStats,
			averageEntryPrice: item.averageEntryPrice || 0,
			unrealizedPnl: item.unrealizedPnl || 0,
		})) || []

		return { balances }
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