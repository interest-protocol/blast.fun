import { gql } from "@apollo/client"

export const GET_POOLS = gql`
	query GetPools($page: Int!, $pageSize: Int!, $sortField: PoolsSortByFields!, $sortDirection: SortByDirection, $filters: PoolsFilters) {
    	pools(page: $page, pageSize: $pageSize, sortBy: { field: $sortField, direction: $sortDirection }, filters: $filters) {
      		pools {
				poolId
				bondingCurve
				coinBalance
				coinType
				createdAt
				creatorAddress
				metadata
				quoteBalance
				migrated
				canMigrate
				nsfw
				lastTradeAt
				publicKey
				innerState
				burnTax
      		}
			total
    	}
  	}
`

export const GET_POOL_BY_COIN_TYPE = gql`
	query GetPoolByCoinType($type: String!) {
		coinPool(type: $type) {
			poolId
		}
	}
`

export const GET_POOL = gql`
	query GetPool($poolId: String!) {
		pool(poolId: $poolId) {
			poolId
			bondingCurve
			coinBalance
			coinType
			createdAt
			creatorAddress
			metadata
			virtualLiquidity
			targetQuoteLiquidity
			quoteBalance
			migrated
			curve
			coinIpxTreasuryCap
			canMigrate
			canonical
			migrationWitness
			nsfw
			lastTradeAt
			config
			updatedAt
			publicKey
			innerState
			burnTax
		}
	}
`

export const GET_POOL_BONDING_PROGRESS = gql`
	query GetPoolBondingProgress($coinType: String!) {
		coinPool(type: $coinType) {
			bondingCurve
			migrated
			canMigrate
		}
	}
`
