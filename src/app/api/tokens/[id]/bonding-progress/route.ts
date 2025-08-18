import { NextRequest, NextResponse } from "next/server"
import { gql } from "@apollo/client"
import { apolloClient } from "@/lib/apollo-client"

interface BondingProgressData {
  coinType: string
  progress: number
  totalBought: number
  totalSold: number
  netAmount: number
  targetAmount: number
  migrated: boolean
  migrationPending: boolean
  timestamp: number
}

// Cache configuration
const CACHE_TTL = 30 * 1000 // 30 seconds
const cache = new Map<string, { data: BondingProgressData; timestamp: number }>()

const BONDING_PROGRESS_QUERY = gql`
  query GetBondingProgress($coinType: String!) {
    coinPool(type: $coinType) {
      poolId
      bondingCurve
      migrated
      canMigrate
      coinBalance
      quoteBalance
      virtualLiquidity
      targetQuoteLiquidity
    }
  }
`

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: coinType } = await context.params
    
    if (!coinType) {
      return NextResponse.json(
        { error: "Token ID is required" },
        { status: 400 }
      )
    }

    // Check cache first
    const cached = cache.get(coinType)
    const now = Date.now()
    
    if (cached && (now - cached.timestamp < CACHE_TTL)) {
      return NextResponse.json(cached.data, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        }
      })
    }

    // Fetch fresh data
    const { data } = await apolloClient.query({
      query: BONDING_PROGRESS_QUERY,
      variables: { coinType },
      fetchPolicy: 'network-only',
    })

    if (!data.coinPool) {
      return NextResponse.json(
        { error: "Pool not found" },
        { status: 404 }
      )
    }

    const pool = data.coinPool
    const progress = typeof pool.bondingCurve === "number" 
      ? pool.bondingCurve 
      : parseFloat(pool.bondingCurve) || 0
    
    const migrated = pool.migrated || false
    const migrationPending = pool.canMigrate || false
    
    // Calculate net amounts from pool balances
    const coinBalance = Number(pool.coinBalance || 0)
    const quoteBalance = Number(pool.quoteBalance || 0)
    const virtualLiquidity = Number(pool.virtualLiquidity || 0)
    const targetQuoteLiquidity = Number(pool.targetQuoteLiquidity || 0)

    const responseData = {
      coinType,
      progress,
      totalBought: quoteBalance,
      totalSold: 0, // Not available from pool data
      netAmount: quoteBalance,
      targetAmount: targetQuoteLiquidity,
      migrated,
      migrationPending,
      timestamp: now
    }

    // Update cache
    cache.set(coinType, {
      data: responseData,
      timestamp: now
    })

    // Clean up old cache entries
    if (cache.size > 1000) {
      const entries = Array.from(cache.entries())
      const oldestEntries = entries
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, 100)
      
      oldestEntries.forEach(([key]) => cache.delete(key))
    }

    return NextResponse.json(responseData, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      }
    })
  } catch (error) {
    console.error("Error fetching bonding progress:", error)
    return NextResponse.json(
      { error: "Failed to fetch bonding progress" },
      { status: 500 }
    )
  }
}