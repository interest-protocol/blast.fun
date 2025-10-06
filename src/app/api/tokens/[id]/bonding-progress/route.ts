import { NextRequest, NextResponse } from "next/server"
import { apolloClient } from "@/lib/apollo-client"
import { redisGet, redisSetEx, CACHE_PREFIX, CACHE_TTL } from "@/lib/redis/client"
import { GET_COIN_POOL_BASIC } from "@/graphql/pools"

interface BondingProgressData {
  progress: number
  migrated: boolean
  migrationPending: boolean
}

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

    // Check Redis cache first
    const cacheKey = `${CACHE_PREFIX.BONDING_PROGRESS}${coinType}`
    const cached = await redisGet(cacheKey)
    
    if (cached) {
      return NextResponse.json(JSON.parse(cached), {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        }
      })
    }

    // Fetch fresh data
    const { data } = await apolloClient.query({
      query: GET_COIN_POOL_BASIC,
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

    // Simplified response - only bonding progress data
    const responseData: BondingProgressData = {
      progress,
      migrated,
      migrationPending
    }

    // Cache in Redis
    await redisSetEx(cacheKey, CACHE_TTL.BONDING_PROGRESS, JSON.stringify(responseData))

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