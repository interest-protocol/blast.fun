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
}