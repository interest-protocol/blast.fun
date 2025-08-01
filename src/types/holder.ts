export type Holder = {
	rank: number
	user: string
	balance: number
	percentage: number
	balanceUsd: number
	balanceScaled: number
}

export type UseHoldersParams = {
	coinType: string
	limit?: number
	skip?: number
}