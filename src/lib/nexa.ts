import { MarketData } from "@/types/market"
import { CoinMetadata } from "@/types/pool"

const NEXA_API_BASE = "https://api-v2.nexa.xyz"

interface NexaRequestOptions extends RequestInit {
	cache?: RequestCache
	revalidate?: number | false
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

	async getCoinMetadata(coinType: string): Promise<CoinMetadata> {
		const response = await this.fetch(`/coins/${coinType}/coin-metadata`, {
			revalidate: 21600, // 6 hours in seconds
		})

		return await response.json() as CoinMetadata
	}

	async getBatchCoinMetadata(coinTypes: string[]) {
		const coinTypesString = coinTypes.join(',')
		const response = await this.fetch(`/coins/multiple/coin-metadata?coins=${encodeURIComponent(coinTypesString)}`, {
			revalidate: 300,
		})

		return await response.json()
	}

	async getMarketData(coinType: string) {
		const response = await this.fetch(`/coins/${coinType}/minified-market-data`, {
			revalidate: 10,
		})

		return await response.json() as MarketData
	}

	async getBatchMarketData(coinTypes: string[]) {
		const coinTypesString = coinTypes.join(',')
		const response = await this.fetch(`/coins/multiple/market-data?coins=${coinTypesString}`, {
			revalidate: 5,
		})

		return await response.json()
	}

	async getHolders(coinType: string, limit = 10, skip = 0) {
		const response = await this.fetch(`/coin-holders/${coinType}/holders?limit=${limit}&skip=${skip}`, {
			revalidate: 10,
		})

		return await response.json()
	}

	async getTrades(coinType: string, limit = 50, skip = 0) {
		const response = await this.fetch(`/coins/${encodeURIComponent(coinType)}/trades?limit=${limit}&skip=${skip}`, {
			revalidate: 5,
		})

		return await response.json()
	}

	async getPortfolio(address: string, minBalanceValue = 0) {
		const response = await this.fetch(`/spot/portfolio/${address}?minBalanceValue=${minBalanceValue}`, {
			revalidate: 30,
		})

		return await response.json()
	}

	async searchTokens(query: string) {
		const url = `/search/query/${encodeURIComponent(query)}?platform=xpump`
		
		const response = await this.fetch(url, {
			revalidate: false,
		})

		return await response.json()
	}
}

export const nexaClient = new NexaClient()