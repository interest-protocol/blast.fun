import type { Token } from "./token"

export interface GetPoolsResponse {
	pools: {
		pools: Token[]
		total: number
	}
}

export interface GetPoolResponse {
	pool: Token
}

export type SortDirection = "ASC" | "DESC"

export type PoolSortField = "createdAt" | "updatedAt" | "bondingCurve" | "quoteBalance" | "lastTradeAt"

export interface PoolSortInput {
	field: PoolSortField
	direction: SortDirection
}

export interface PoolFilterInput {
	coinType?: string
	curve?: string
	search?: string
	config?: string
	canonicalOnly?: boolean
	createdAt?: string
	minCreatedAt?: string
	minMarketCap?: string
	creatorAddress?: string
	minBondingCurve?: number
	minLastTradeAt?: string
	nsfw?: boolean
}

export interface GetPoolsVariables {
	page: number
	pageSize: number
	sortBy?: PoolSortInput
	filters?: PoolFilterInput
}

export interface GetPoolVariables {
	poolId: string
}
