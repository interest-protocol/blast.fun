import type { PortfolioResponse } from "@/types/portfolio"

/**
 * Fetches portfolio balances from NEXA via API route.
 */
export async function fetchPortfolio(address: string): Promise<PortfolioResponse> {
	const response = await fetch(`/api/portfolio?address=${encodeURIComponent(address)}`)

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
	const response = await fetch(
		`/api/portfolio?address=${encodeURIComponent(address)}&coinType=${encodeURIComponent(coinType)}`
	)

	if (!response.ok) {
		throw new Error(`Failed to fetch balance: ${response.statusText}`)
	}

	const data = await response.json()
	return data.balance || "0"
}