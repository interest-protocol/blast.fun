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
			revalidate: 120, // 2 minutes
		})

		return await response.json() as MarketData
	}

	async getHolders(coinType: string, limit = 10, skip = 0) {
		const response = await this.fetch(`/coin-holders/${encodeURIComponent(coinType)}/holders?limit=${limit}&skip=${skip}`, {
			revalidate: 30, // 30 seconds
		})

		return await response.json()
	}

	async getCoinMetadata(coinType: string): Promise<CoinMetadata> {
		const response = await this.fetch(`/coins/${coinType}/coin-metadata`, {
			revalidate: 43200, // 12 hours
		})

		return await response.json() as CoinMetadata
	}

	async getPortfolio(address: string) {
		const response = await this.fetch(`/user/${address}/portfolio`, {
			revalidate: 10,
		})

		return await response.json()
	}
}

export const nexaServerClient = new NexaServerClient()