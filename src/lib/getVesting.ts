export interface VestingPosition {
	objectId: string
	balance: string
	released: string
	start: string
	duration: string
	owner: string
	coinType: string
	isDestroyed: boolean
}

export interface VestingStats {
	coinType: string
	totalAmountLocked: string
	numberOfUsers: number
}

export interface VestingByCoinResponse {
	stats: VestingStats
	total: number
	totalPages: number
	data: VestingPosition[]
}

export interface VestingByUserResponse {
	total: number
	totalPages: number
	data: VestingPosition[]
}

export interface VestingApiParams {
	limit?: number
	offset?: number
}

export interface CoinMetadata {
	id: string
	decimals: number
	name: string
	symbol: string
	description: string
	iconUrl: string
	type: string
}

const BASE_URL = "https://api.interestlabs.io/v1/vesting"

export class VestingApi {
	static async getVestingsByCoinType(
		coinType: string,
		params: VestingApiParams = {}
	): Promise<VestingByCoinResponse> {
		const { limit = 20, offset = 0 } = params
		const url = new URL(`${BASE_URL}/coin/${encodeURIComponent(coinType)}`)
		url.searchParams.set("limit", limit.toString())
		url.searchParams.set("offset", offset.toString())

		const response = await fetch(url.toString())
		
		if (!response.ok) {
			throw new Error(`Failed to fetch vestings by coin type: ${response.statusText}`)
		}

		return response.json()
	}

	static async getAllVestingsByCoinType(
		coinType: string
	): Promise<VestingByCoinResponse> {
		const limit = 50
		let offset = 0
		let allData: VestingPosition[] = []
		
		// @dev: Fetch first page to get stats and total count
		const firstResponse = await this.getVestingsByCoinType(coinType, { limit, offset })
		allData = [...firstResponse.data]
		const stats = firstResponse.stats
		const total = firstResponse.total
		
		// @dev: If there are more pages, fetch them all
		while (allData.length < total && firstResponse.totalPages > 1) {
			offset += limit
			const response = await this.getVestingsByCoinType(coinType, { limit, offset })
			allData = [...allData, ...response.data]
			
			// @dev: Break if no more data returned to prevent infinite loops
			if (response.data.length === 0) {
				break
			}
		}
		
		return {
			stats,
			total,
			totalPages: Math.ceil(total / limit),
			data: allData
		}
	}

	static async getVestingsByUser(
		address: string,
		params: VestingApiParams = {}
	): Promise<VestingByUserResponse> {
		const { limit = 20, offset = 0 } = params
		const url = new URL(`${BASE_URL}/user/${address}`)
		url.searchParams.set("limit", limit.toString())
		url.searchParams.set("offset", offset.toString())

		const response = await fetch(url.toString())
		
		if (!response.ok) {
			throw new Error(`Failed to fetch vestings by user: ${response.statusText}`)
		}

		return response.json()
	}

	static async getCoinMetadata(coinTypes: string[]): Promise<(CoinMetadata | null)[]> {
		if (coinTypes.length === 0) return []

		const response = await fetch("/api/coins/metadata", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify({ coinTypes }),
		})

		if (!response.ok) {
			throw new Error(`Failed to fetch coin metadata: ${response.statusText}`)
		}

		return response.json()
	}

}