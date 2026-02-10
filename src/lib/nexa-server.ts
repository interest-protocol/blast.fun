import { env } from "@/env"
import type { TokenMarketData } from "@/types/token"
import type { TokenMetadata } from "@/types/token"
import type { LeaderboardEntry } from "@/types/leaderboard"

const NEXA_SERVER_API_BASE = "https://spot.api.sui-prod.bluefin.io/external-api/insidex"

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
            console.warn(`Nexa Server API error for ${url}: ${response.status} - ${errorText}`)
            
            // @dev: Return null instead of throwing for 503/502/504 errors
            if ([502, 503, 504].includes(response.status)) {
                return null
            }
            
            throw new Error(`Nexa Server API error: ${response.status}`)
        }

        return await response.json()
	}

	async getMarketData(coinType: string): Promise<TokenMarketData> {
		const response = await this.fetch(`/coins/${coinType}/market-data`)
		return await response.json() as TokenMarketData
	}

	async getCoinMetadata(coinType: string): Promise<TokenMetadata> {
		const response = await this.fetch(`/coins/${coinType}/coin-metadata`, {
			revalidate: 43200, // 12 hours
		})

		return await response.json() as TokenMetadata
	}

	async getPortfolio(address: string) {
		const response = await this.fetch(`/user/${address}/portfolio`, {
			revalidate: 10,
		})

		return await response.json()
	}

	async getLeaderboard(params?: {
		sortOn?: 'totalVolume' | 'tradeCount'
		startTime?: number
		endTime?: number
		skip?: number
		limit?: number
	}): Promise<LeaderboardEntry[]> {
		const searchParams = new URLSearchParams()

		if (params?.sortOn) searchParams.append('sortOn', params.sortOn)
		if (params?.startTime) searchParams.append('startTime', params.startTime.toString())
		if (params?.endTime) searchParams.append('endTime', params.endTime.toString())
		if (params?.skip !== undefined) searchParams.append('skip', params.skip.toString())
		if (params?.limit !== undefined) searchParams.append('limit', params.limit.toString())

		const queryString = searchParams.toString()
		const endpoint = queryString ? `/blast-fun/leaderboard?${queryString}` : '/blast-fun/leaderboard'

		const response = await this.fetch(endpoint, {
			revalidate: 60, // Cache for 1 minute
		})

		return await response.json() as LeaderboardEntry[]
	}
}

export const nexaServerClient = new NexaServerClient()