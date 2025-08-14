import { env } from "@/env"
import { MarketData } from "@/types/market"
import { CoinMetadata } from "@/types/pool"

const NEXA_SERVER_API_BASE = "https://api-ex.insidex.trade"

interface NexaServerRequestOptions extends RequestInit {
	revalidate?: number | false
}

class NexaServerClient {
	private baseUrl: string
	private apiKey: string

	constructor() {
		this.baseUrl = NEXA_SERVER_API_BASE
		this.apiKey = env.NEXA_API_KEY
	}

	private async fetch(endpoint: string, options?: NexaServerRequestOptions) {
		const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`

		const response = await fetch(url, {
			...options,
			headers: {
				"Content-Type": "application/json",
				"x-api-key": this.apiKey,
				...options?.headers,
			},
			next: {
				revalidate: options?.revalidate ?? 10,
			},
		})

		if (!response.ok) {
			const errorText = await response.text().catch(() => "Unknown error")
			console.error(`Nexa Server API error for ${url}: ${response.status} - ${errorText}`)
			throw new Error(`Nexa Server API error: ${response.status}`)
		}

		return response
	}

	async getMarketData(coinType: string): Promise<MarketData> {
		const response = await this.fetch(`/coins/${coinType}/market-data`, {
			revalidate: 300, // 5 minutes
		})

		return await response.json() as MarketData
	}

	async getCoinMetadata(coinType: string): Promise<CoinMetadata> {
		const response = await this.fetch(`/coins/${coinType}/coin-metadata`, {
			revalidate: 43200, // 12 hours
		})

		return await response.json() as CoinMetadata
	}

	async getBatchMarketData(coinTypes: string[]): Promise<Record<string, MarketData>> {
		const coinTypesString = coinTypes.join(',')
		const response = await this.fetch(`/coins/multiple/market-data?coins=${encodeURIComponent(coinTypesString)}`, {
			revalidate: 300, // 5 minutes
		})

		return await response.json()
	}

	async getBatchCoinMetadata(coinTypes: string[]): Promise<Record<string, CoinMetadata>> {
		const coinTypesString = coinTypes.join(',')
		const response = await this.fetch(`/coins/multiple/coin-metadata?coins=${encodeURIComponent(coinTypesString)}`, {
			revalidate: 43200, // 12 hours
		})

		return await response.json()
	}
}

export const nexaServerClient = new NexaServerClient()