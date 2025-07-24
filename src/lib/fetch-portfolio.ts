import { env } from "@/env"
import type { PortfolioResponse } from "@/types/portfolio"

/**
 * Fetches portfolio balances from NEXA.
 */
export async function fetchPortfolio(address: string): Promise<PortfolioResponse> {
	const response = await fetch(
		`https://api-ex.insidex.trade/spot-portfolio/${address}?minBalanceValue=0`,
		{
			headers: {
				"x-api-key": env.NEXA_API_KEY,
				"Content-Type": "application/json",
			},
		}
	)

	if (!response.ok) {
		throw new Error(`Failed to fetch portfolio: ${response.statusText}`)
	}

	const data = await response.json() as PortfolioResponse
	return data
}

/**
 * Fetches balance for a specific coin type
 */
export async function fetchCoinBalance(address: string, coinType: string): Promise<string> {
	const portfolio = await fetchPortfolio(address)
	const balance = portfolio.balances.find(b => b.coinType === coinType)
	return balance?.balance || "0"
}