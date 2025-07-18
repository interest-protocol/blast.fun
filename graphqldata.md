Based on my analysis of the Memez API GraphQL interface, here's a comprehensive breakdown of all available calls, data formats, and everything you need to know:

API Overview
Base Endpoint: https://api.memez.interestlabs.io/v1/graphql
Type: Read-only GraphQL API (no mutations available)
Purpose: DeFi meme coin pools, trading data, and holder positions on Sui blockchain

Available Queries
1. Get Specific Pool
query {
  pool(poolId: "pool_id_here") {
    poolId
    coinType
    metadata
    quoteBalance
    coinBalance
    bondingCurve
    createdAt
    lastTradeAt
    creatorAddress
    nsfw
    migrated
    canMigrate
  }
}
2. Get Pool by Coin Type
query {
  coinPool(type: "coin_type_here") {
    poolId
    coinType
    # ... same fields as above
  }
}
3. Get Pools List (Paginated)
query {
  pools(
    page: 1
    pageSize: 20
    sortBy: { field: createdAt, direction: DESC }
    filters: {
      coinType: "optional_filter"
      search: "search_term"
      canonicalOnly: true
      minMarketCap: "1000000"
      nsfw: false
    }
  ) {
    pools {
      poolId
      coinType
      metadata
      quoteBalance
      coinBalance
      bondingCurve
      createdAt
      lastTradeAt
    }
    total
  }
}
4. Get Market Trades
query {
  marketTrades(
    page: 1
    pageSize: 20
    sortBy: { field: time, direction: DESC }
    filters: {
      # Add available filters here
    }
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
5. Get Holder Positions
query {
  holderPositions(
    holder: "wallet_address_here"
    page: 1
    pageSize: 20
    sortBy: { field: createdAt, direction: DESC }
    filters: {
      # Same filters as pools
    }
  ) {
    positions {
      type
      balance
      pool {
        poolId
        coinType
        metadata
        quoteBalance
        coinBalance
        bondingCurve
      }
    }
    total
  }
}
Data Types & Fields
Pool Object
poolId (String, required): Unique pool identifier
coinType (String, required): Associated coin type
metadata (JSON): Social media and pool information
quoteBalance (String, required): Available SUI balance
coinBalance (String, required): Available coin balance
bondingCurve (Float, required): Curve percentage (0-100)
createdAt (String, required): Creation timestamp
lastTradeAt (String): Last trade timestamp
creatorAddress (String, required): Creator's wallet address
nsfw (Boolean): Content safety flag
migrated (Boolean, required): Migration status
canMigrate (Boolean, required): Can be migrated
MarketTrade Object
time (String, required): Trade timestamp
type (String, required): Trade type/coin identifier
price (String, required): Asset price
volume (Float, required): Trade volume
trader (String, required): Trader's address
kind (TradeKind, required): "buy" or "sell"
quoteAmount (String, required): SUI amount
coinAmount (String, required): Coin amount
digest (String, required): Transaction reference
HolderPosition Object
type (String, required): Holding coin type
balance (String, required): Balance amount
pool (Pool, required): Associated pool details
Filtering Options
Pool Filters
coinType: Filter by specific coin type
curve: Filter by curve type
search: Search by name, symbol, or types
config: Filter by config key type
canonicalOnly: Only canonical pools (default: true)
createdAt: Exact creation date
minCreatedAt: Minimum creation date
minMarketCap: Minimum market cap in SUI
creatorAddress: Creator's wallet address
minBondingCurve: Minimum bonding curve percentage
minLastTradeAt: Minimum last trade date
nsfw: Include NSFW content (default: false)
Sorting Options
Available fields: createdAt, updatedAt, bondingCurve, quoteBalance, lastTradeAt
Directions: ASC, DESC

Sample API Call (cURL)
curl -X POST -H "Content-Type: application/json" \
  -d '{"query": "{ pools(page: 1, pageSize: 10, sortBy: { field: createdAt, direction: DESC }) { pools { poolId coinType quoteBalance bondingCurve createdAt } total } }"}' \
  https://api.memez.interestlabs.io/v1/graphql
