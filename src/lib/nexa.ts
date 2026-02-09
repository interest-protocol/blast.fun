import type { TokenMarketData } from "@/types/token"
import type { TokenMetadata } from "@/types/token"

const NEXA_API_BASE = "https://spot.api.sui-prod.bluefin.io/internal-api/insidex"

interface NexaRequestOptions extends RequestInit {
	cache?: RequestCache
	revalidate?: number | false
}

export interface MarketStats {
	_id: string
	user: string
	coin: string
	amountBought: number
	amountSold: number
	buyTrades: number
	currentHolding: number
	pnl: number
	sellTrades: number
	usdBought: number
	usdSold: number
}

class NexaClient {
	private baseUrl: string

	constructor() {
		this.baseUrl = NEXA_API_BASE
	}

	private async fetch(endpoint: string, options?: NexaRequestOptions) {
		const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`

		const response = await fetch(url, {
			...options,
			headers: {
				"Content-Type": "application/json",
				...options?.headers,
			},
			next: {
				revalidate: options?.revalidate ?? 10,
			},
		})

		if (!response.ok) {
			const errorText = await response.text().catch(() => "Unknown error")
			throw new Error(`NEXA API error: ${response.status} - ${errorText}`)
		}

		return response
	}

	/**
	 * Fetches coin metadata via app API (Noodles coin-detail first, then fallbacks).
	 */
	async getCoinMetadata(coinType: string): Promise<TokenMetadata | null> {
		try {
			const response = await fetch(
				`/api/coin/${encodeURIComponent(coinType)}/metadata`,
				{
					headers: { Accept: "application/json" },
					next: { revalidate: 3600 },
				}
			)

			if (!response.ok) return null

			const text = await response.text()
			if (!text || text.trim() === "") return null

			try {
				return JSON.parse(text) as TokenMetadata
			} catch {
				return null
			}
		} catch (error) {
			console.error("Error fetching coin metadata:", error)
			return null
		}
	}

	async getBatchCoinMetadata(coinTypes: string[]) {
		try {
			const coinTypesString = coinTypes.join(',')
			const response = await this.fetch(`/coins/multiple/coin-metadata?coins=${encodeURIComponent(coinTypesString)}`, {
				revalidate: 300,
			})

			const text = await response.text()
			if (!text || text.trim() === '') return {}

			try {
				return JSON.parse(text)
			} catch {
				return {}
			}
		} catch (error) {
			console.error('Error fetching batch coin metadata:', error)
			return {}
		}
	}

	/**
	 * Fetches market data via app API (Noodles coin-detail + coin-price-volume first, Bluefin fallback).
	 * Replaces direct Bluefin minified-market-data which is no longer available in farms.
	 */
	async getMarketData(coinType: string): Promise<TokenMarketData | null> {
		try {
			const response = await fetch(
				`/api/coin/${encodeURIComponent(coinType)}/market-data`,
				{
					headers: { Accept: "application/json" },
					next: { revalidate: 10 },
				}
			)

			if (!response.ok) return null

			const text = await response.text()
			if (!text || text.trim() === "") return null

			try {
				return JSON.parse(text) as TokenMarketData
			} catch {
				return null
			}
		} catch (error) {
			console.error("Error fetching market data:", error)
			return null
		}
	}

	async getBatchMarketData(coinTypes: string[]) {
		try {
			const coinTypesString = coinTypes.join(',')
			const response = await this.fetch(`/coins/multiple/market-data?coins=${coinTypesString}`, {
				revalidate: 5,
			})

			const text = await response.text()
			if (!text || text.trim() === '') return []

			try {
				return JSON.parse(text)
			} catch {
				return []
			}
		} catch (error) {
			console.error('Error fetching batch market data:', error)
			return []
		}
	}

	async getHolders(coinType: string, limit = 10, skip = 0) {
		try {
			const response = await this.fetch(`/coin-holders/${coinType}/holders?limit=${limit}&skip=${skip}`, {
				revalidate: 10,
			})

			const text = await response.text()
			if (!text || text.trim() === '') return { holders: [], total: 0 }

			try {
				return JSON.parse(text)
			} catch {
				return { holders: [], total: 0 }
			}
		} catch (error) {
			console.error('Error fetching holders:', error)
			return { holders: [], total: 0 }
		}
	}

	async getTrades(coinType: string, limit = 50, skip = 0) {
		try {
			const response = await this.fetch(`/coins/${encodeURIComponent(coinType)}/trades?limit=${limit}&skip=${skip}`, {
				revalidate: 5,
			})

			const text = await response.text()
			if (!text || text.trim() === '') return { trades: [], total: 0 }

			try {
				return JSON.parse(text)
			} catch {
				return { trades: [], total: 0 }
			}
		} catch (error) {
			console.error('Error fetching trades:', error)
			return { trades: [], total: 0 }
		}
	}

	/**
	 * Fetches portfolio via app API (Noodles portfolio/coins first, Bluefin fallback).
	 */
	async getPortfolio(address: string, _minBalanceValue = 0) {
		try {
			const response = await fetch(
				`/api/portfolio/${encodeURIComponent(address)}`,
				{
					headers: { Accept: "application/json" },
					next: { revalidate: 30 },
				}
			)

			if (!response.ok) return null

			const text = await response.text()
			if (!text || text.trim() === "") return null

			try {
				return JSON.parse(text) as { balances: unknown[] }
			} catch {
				return null
			}
		} catch (error) {
			console.error("Error fetching portfolio:", error)
			return null
		}
	}

	/**
	 * Search tokens via app API (Noodles global-search scope=coin first, Bluefin fallback).
	 */
	async searchTokens(query: string) {
		try {
			const response = await fetch(
				`/api/search/tokens?q=${encodeURIComponent(query)}`,
				{
					headers: { Accept: "application/json" },
					next: { revalidate: 60 },
				}
			)

			if (!response.ok) return []

			const text = await response.text()
			if (!text || text.trim() === "") return []

			try {
				const parsed = JSON.parse(text)
				return Array.isArray(parsed) ? parsed : []
			} catch {
				return []
			}
		} catch (error) {
			console.error("Error searching tokens:", error)
			return []
		}
	}

	async getMarketStats(address: string, coinType: string): Promise<MarketStats | null> {
		try {
			const response = await this.fetch(`/spot/market-stats/${address}/${encodeURIComponent(coinType)}`, {
				revalidate: 10,
			})

			const text = await response.text()
			if (!text || text.trim() === '') return null

			try {
				return JSON.parse(text) as MarketStats
			} catch {
				return null
			}
		} catch (error) {
			console.error('Error fetching market stats:', error)
			return null
		}
	}
}

export const nexaClient = new NexaClient()