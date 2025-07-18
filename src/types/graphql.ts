import type { Pool } from './pool'

export interface GetPoolsResponse {
  pools: {
    pools: Pool[]
  }
}

export interface GetPoolResponse {
  pool: Pool
}

export interface GetPoolsVariables {
  page: number
  pageSize: number
}

export interface GetPoolVariables {
  poolId: string
}