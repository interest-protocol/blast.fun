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

export const GET_RECENT_TRADES = gql`
  query GetRecentTrades($page: Int!, $pageSize: Int!) {
    marketTrades(
      page: $page
      pageSize: $pageSize
      sortBy: { field: createdAt, direction: DESC }
    ) {
      trades {
        coinAmount
        quoteAmount
        trader
        type
        kind
        time
      }
    }
  }
`