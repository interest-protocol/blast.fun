import type { Pool } from './pool'

export interface GetPoolsResponse {
  pools: {
    pools: Pool[]
    total: number
  }
}

export interface GetPoolResponse {
  pool: Pool
}

export type SortDirection = 'ASC' | 'DESC'

export type PoolSortField = 'createdAt' | 'updatedAt' | 'bondingCurve' | 'quoteBalance' | 'lastTradeAt'

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