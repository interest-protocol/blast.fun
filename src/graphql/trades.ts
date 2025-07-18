import { gql } from '@apollo/client'

export const GET_MARKET_TRADES = gql`
  query GetMarketTrades(
    $coinType: String!
    $page: Int
    $pageSize: Int
    $sortBy: SortBy
  ) {
    marketTrades(
      page: $page
      pageSize: $pageSize
      sortBy: $sortBy
      filters: { coinType: $coinType }
    ) {
      trades {
        time
        type
        price
        volume
        trader
        kind
        quoteAmount
        coinAmount
        digest
      }
      total
    }
  }
`

export const GET_POOL_TRADES = gql`
  query GetPoolTrades(
    $poolId: String!
    $page: Int
    $pageSize: Int
  ) {
    marketTrades(
      page: $page
      pageSize: $pageSize
      sortBy: { field: time, direction: DESC }
      filters: { poolId: $poolId }
    ) {
      trades {
        time
        type
        price
        volume
        trader
        kind
        quoteAmount
        coinAmount
        digest
      }
      total
    }
  }
`