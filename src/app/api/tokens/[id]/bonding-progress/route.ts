import { NextRequest, NextResponse } from "next/server"
import { redisGet, redisSetEx, CACHE_PREFIX, CACHE_TTL } from "@/lib/redis/client"
import { fetchNoodlesCoinList } from "@/lib/noodles/client"

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

    const coinListRes = await fetchNoodlesCoinList({
      filters: { coinIds: [coinType] },
      pagination: { limit: 1 },
    })

    const coinData = coinListRes?.data?.[0]
    if (!coinData) {
      return NextResponse.json(
        { error: "Pool not found" },
        { status: 404 }
      )
    }

    const progress = coinData.bondingCurveProgress ?? 0
    const migrated = coinData.graduatedTime != null
    const migrationPending = false

    const responseData: BondingProgressData = {
      progress,
      migrated,
      migrationPending
    }

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
