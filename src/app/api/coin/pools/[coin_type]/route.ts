import { NextResponse } from "next/server"
import { blockVisionService } from "@/services/blockvision.service"
import { redisGet, redisSetEx } from "@/lib/redis/client"
import type { DexPool } from "@/types/blockvision"

export const dynamic = "force-dynamic"

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ coin_type: string }> }
) {
	try {
		const { coin_type } = await params
		const coinType = decodeURIComponent(coin_type)
		console.log(`🏊 Fetching pools for coin: ${coinType}`)

		// @dev: Check Redis cache first
		const cacheKey = `coin:pools:${coinType}`
		const cached = await redisGet(cacheKey)
		
		if (cached) {
			console.log(`✅ Returning cached pools data for ${coinType}`)
			return NextResponse.json(JSON.parse(cached), {
				headers: {
					"Cache-Control": "public, s-maxage=15, stale-while-revalidate=30",
				},
			})
		}

		// @dev: Fetch from BlockVision API
		const poolsResponse = await blockVisionService.getDexPools(coinType)
		
		if (!poolsResponse.success || !poolsResponse.data) {
			console.error(`❌ Failed to fetch DEX pools: ${poolsResponse.error}`)
			return NextResponse.json(
				{ error: poolsResponse.error || "Failed to fetch DEX pools" },
				{ status: 500 }
			)
		}

		// @dev: Sort pools by TVL (descending)
		const sortedPools = [...poolsResponse.data].sort((a, b) => {
			const tvlA = parseFloat(a.tvl.replace(/,/g, ""))
			const tvlB = parseFloat(b.tvl.replace(/,/g, ""))
			return tvlB - tvlA
		})

		const response = {
			pools: sortedPools,
			total: sortedPools.length,
			timestamp: Date.now(),
		}

		// @dev: Cache for 5 seconds in Redis
		await redisSetEx(cacheKey, 5, JSON.stringify(response))

		console.log(`✅ Fetched and cached ${sortedPools.length} pools for ${coinType}`)
		
		// @dev: Return with edge cache headers (15 seconds)
		return NextResponse.json(response, {
			headers: {
				"Cache-Control": "public, s-maxage=15, stale-while-revalidate=30",
			},
		})

	} catch (error) {
		console.error("Error fetching coin pools:", error)
		return NextResponse.json(
			{ error: "Failed to fetch coin pools" },
			{ status: 500 }
		)
	}
}