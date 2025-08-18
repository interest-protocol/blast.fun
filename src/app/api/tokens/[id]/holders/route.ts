import { NextRequest, NextResponse } from "next/server"
import { nexaClient } from "@/lib/nexa"
import { gql } from "@apollo/client"
import { apolloClient } from "@/lib/apollo-client"

interface HolderData {
  rank: number
  user: string
  balance: number
  percentage: number
  isCreator: boolean
}

interface HoldersResponseData {
  coinType: string
  creatorAddress: string
  holders: HolderData[]
  totalHoldings: number
  timestamp: number
}

// Cache configuration
const CACHE_TTL = 30 * 1000 // 30 seconds
const cache = new Map<string, { data: HoldersResponseData; timestamp: number }>()

const POOL_QUERY = gql`
  query GetPoolCreator($coinType: String!) {
    coinPool(type: $coinType) {
      poolId
      creatorAddress
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

    // Fetch fresh data - get holders and pool data in parallel
    const [holdersData, { data: poolData }] = await Promise.all([
      nexaClient.getHolders(coinType, 10, 0),
      apolloClient.query({
        query: POOL_QUERY,
        variables: { coinType },
        fetchPolicy: 'network-only',
      })
    ])

    if (!holdersData || holdersData.length === 0) {
      return NextResponse.json(
        { error: "No holders found" },
        { status: 404 }
      )
    }

    const creatorAddress = poolData?.coinPool?.creatorAddress || ""

    // Process holders data
    const holders: HolderData[] = holdersData.map((holder: any, index: number) => ({
      rank: index + 1,
      user: holder.user,
      balance: holder.balance || 0,
      percentage: holder.percentage || 0,
      isCreator: holder.user.toLowerCase() === creatorAddress.toLowerCase()
    }))

    // Calculate total holdings
    const totalHoldings = holders.reduce((sum, holder) => sum + holder.balance, 0)

    const responseData: HoldersResponseData = {
      coinType,
      creatorAddress,
      holders,
      totalHoldings,
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
    console.error("Error fetching holders:", error)
    return NextResponse.json(
      { error: "Failed to fetch holders" },
      { status: 500 }
    )
  }
}