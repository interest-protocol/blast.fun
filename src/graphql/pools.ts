import { gql } from '@apollo/client'

export const GET_POOLS = gql`
	query GetPools($page: Int!, $pageSize: Int!) {
    	pools(page: $page, pageSize: $pageSize) {
      		pools {
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
      		}
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
		}
	}
`