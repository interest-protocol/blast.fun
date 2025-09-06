import { NextResponse } from "next/server"
import { redisGet, redisSetEx } from "@/lib/redis/client"
import { blockVisionService } from "@/services/blockvision.service"

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: Promise<{ coin_type: string }> }) {
	try {
		const { coin_type } = await params
		const coinType = decodeURIComponent(coin_type)
		console.log(`📊 Fetching holders for coin: ${coinType}`)

		// @dev: Check Redis cache first
		const cacheKey = `coin:holders:${coinType}`
		const cached = await redisGet(cacheKey)

		if (cached) {
			console.log(`✅ Returning cached holders data for ${coinType}`)
			return NextResponse.json(JSON.parse(cached), {
				headers: {
					"Cache-Control": "public, s-maxage=15, stale-while-revalidate=30",
				},
			})
		}

		// @dev: Fetch from BlockVision API - get top 50 holders
		const holdersResponse = await blockVisionService.getCoinHolders(coinType, 50)

		if (!holdersResponse.success || !holdersResponse.data) {
			console.error(`❌ Failed to fetch holders: ${holdersResponse.error}`)
			return NextResponse.json({ error: holdersResponse.error || "Failed to fetch holders" }, { status: 500 })
		}

		const response = {
			holders: holdersResponse.data,
			timestamp: Date.now(),
		}

		// @dev: Cache for 5 seconds in Redis
		await redisSetEx(cacheKey, 5, JSON.stringify(response))

		console.log(`✅ Fetched and cached ${holdersResponse.data.length} holders for ${coinType}`)

		// @dev: Return with edge cache headers (15 seconds)
		return NextResponse.json(response, {
			headers: {
				"Cache-Control": "public, s-maxage=15, stale-while-revalidate=30",
			},
		})
	} catch (error) {
		console.error("Error fetching coin holders:", error)
		return NextResponse.json({ error: "Failed to fetch coin holders" }, { status: 500 })
	}
}
