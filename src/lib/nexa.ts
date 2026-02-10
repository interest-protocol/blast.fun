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
	private maxRetries: number = 2
	private retryDelay: number = 1000

	constructor() {
		this.baseUrl = NEXA_API_BASE
	}

	private async fetchWithRetry(
		url: string,
		options: RequestInit,
		retries: number = 0
	): Promise<Response> {
		try {
			const controller = new AbortController()
			const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

			const response = await fetch(url, {
				...options,
				signal: controller.signal,
			})

			clearTimeout(timeoutId)
			return response
		} catch (error) {
			if (retries < this.maxRetries) {
				console.warn(`Fetch failed for ${url}, retrying (${retries + 1}/${this.maxRetries})...`)
				await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retries + 1)))
				return this.fetchWithRetry(url, options, retries + 1)
			}
			throw error
		}
	}

	private async fetch(endpoint: string, options?: NexaRequestOptions) {
		const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`

		try {
			const response = await this.fetchWithRetry(url, {
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
				console.warn(`NEXA API error for ${url}: ${response.status} - ${errorText}`)
				
				// Don't throw for service unavailable errors - return null response
				if ([502, 503, 504].includes(response.status)) {
					throw new Error(`Service temporarily unavailable`)
				}
				
				throw new Error(`NEXA API error: ${response.status}`)
			}

			return response
		} catch (error) {
			console.warn(`NEXA API request failed for ${url}:`, error)
			throw error // Re-throw to be handled by calling methods
		}
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