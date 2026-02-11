import type { PortfolioResponse, PortfolioBalanceItem } from "@/types/portfolio"
import { BASE_DOMAIN } from "@/constants"

/**
 * Fetch portfolio from Noodles via /api/portfolio. No GraphQL enrichment needed;
 * coinType is used for navigation in portfolio-table-row.
 */
export async function fetchPortfolio(address: string): Promise<PortfolioResponse> {
	try {
		const base = typeof window !== "undefined" ? "" : BASE_DOMAIN
		const res = await fetch(`${base}/api/portfolio/${encodeURIComponent(address)}`, {
			headers: { Accept: "application/json" },
		})
		if (!res.ok) return { balances: [] }
		const data = await res.json()

		if (!data || !data.balances) return { balances: [] }

		const rawBalances = data.balances as Array<Record<string, unknown>>
		const balances: PortfolioBalanceItem[] = rawBalances.map((item) => ({
			coinType: (item.coinType as string) ?? "",
			balance: item.balance != null ? String(item.balance) : "0",
			price: Number(item.price) || 0,
			value: Number(item.value) || 0,
			coinMetadata: item.coinMetadata as PortfolioBalanceItem["coinMetadata"],
			marketStats: item.marketStats as PortfolioBalanceItem["marketStats"],
			averageEntryPrice: Number(item.averageEntryPrice) || 0,
			unrealizedPnl: Number(item.unrealizedPnl) || 0,
		}))

		return { balances }
	} catch (error) {
		console.error("Failed to fetch portfolio:", error)
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