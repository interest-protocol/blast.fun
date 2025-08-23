import { NextResponse } from "next/server"
import { blockVisionService } from "@/services/blockvision.service"
import { redisGet, redisSetEx } from "@/lib/redis/client"
import type { CoinHolder } from "@/types/blockvision"

export const dynamic = "force-dynamic"

export async function GET(
	request: Request,
	{ params }: { params: { coin_type: string } }
) {
	try {
		const coinType = decodeURIComponent(params.coin_type)
		console.log(`📊 Fetching holders for coin: ${coinType}`)

		// @dev: Check Redis cache first
		const cacheKey = `coin:holders:${coinType}`
		const cached = await redisGet(cacheKey)
		
		if (cached) {
			console.log(`✅ Returning cached holders data for ${coinType}`)
			return NextResponse.json(JSON.parse(cached))
		}

		// @dev: Fetch from BlockVision API - get top 10 holders
		const holdersResponse = await blockVisionService.getCoinHolders(coinType, 10)
		
		if (!holdersResponse.success || !holdersResponse.data) {
			console.error(`❌ Failed to fetch holders: ${holdersResponse.error}`)
			return NextResponse.json(
				{ error: holdersResponse.error || "Failed to fetch holders" },
				{ status: 500 }
			)
		}

		const response = {
			holders: holdersResponse.data,
			timestamp: Date.now(),
		}

		// @dev: Cache for 30 seconds
		await redisSetEx(cacheKey, 30, JSON.stringify(response))

		console.log(`✅ Fetched and cached ${holdersResponse.data.length} holders for ${coinType}`)
		return NextResponse.json(response)

	} catch (error) {
		console.error("Error fetching coin holders:", error)
		return NextResponse.json(
			{ error: "Failed to fetch coin holders" },
			{ status: 500 }
		)
	}
}