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
const METADATA_BASE_URL = "https://api.interestlabs.io/v1/coins"

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

	static async getCoinMetadata(coinTypes: string[]): Promise<CoinMetadata[]> {
		if (coinTypes.length === 0) return []

		// @dev: Join coin types with comma and encode for URL
		const coinTypesParam = coinTypes.map(encodeURIComponent).join(',')
		const url = `${METADATA_BASE_URL}/mainnet/metadatas?coinTypes=${coinTypesParam}`

		const response = await fetch(url, {
			headers: {
				'Chain': 'sui'
			}
		})

		if (!response.ok) {
			throw new Error(`Failed to fetch coin metadata: ${response.statusText}`)
		}

		return response.json()
	}
}