import { NextResponse } from "next/server"
import { env } from "@/env"
import { enhanceTokens } from "@/lib/enhance-token"
import { mapNoodlesCoinToToken } from "@/lib/noodles/map-noodles-to-token"
import { NOODLES_API_BASE } from "@/lib/noodles/types"
import { processTokenIconUrls } from "@/lib/process-token-icon-urls"

export const revalidate = 5

export async function GET(request: Request) {
	try {
		const apiKey = env.NOODLES_API_KEY
		if (!apiKey) {
			return NextResponse.json(
				{ error: "Noodles API key not configured" },
				{ status: 503 }
			)
		}

		const { searchParams } = new URL(request.url)

		const body = {
			pagination: {
				offset: Number(searchParams.get("offset") ?? 0),
				limit: Number(searchParams.get("limit") ?? 20),
			},
			filters: {
				min_liquidity: searchParams.get("minLiquidity")
					? Number(searchParams.get("minLiquidity"))
					: undefined,
				min_market_cap: searchParams.get("minMarketCap")
					? Number(searchParams.get("minMarketCap"))
					: undefined,
				has_social: searchParams.get("hasSocial") === "true" ? true : undefined,
				verified: searchParams.get("verified") === "true" ? true : undefined,
			},
		}

		const response = await fetch(`${NOODLES_API_BASE}/api/v1/partner/coin-new`, {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				"x-api-key": apiKey,
				"x-chain": "sui",
			},
			body: JSON.stringify(body),
			next: { revalidate: 1 },
		})

		if (!response.ok) {
			throw new Error(`Noodles API error: ${response.status}`)
		}

		const json = (await response.json()) as { data?: unknown[] }
		const rawList = Array.isArray(json?.data) ? json.data : []

		const mappedTokens = rawList.map((item) => mapNoodlesCoinToToken(item as Parameters<typeof mapNoodlesCoinToToken>[0]))
		const enhancedTokens = await enhanceTokens(mappedTokens)
		const processedTokens = processTokenIconUrls(enhancedTokens)

		return NextResponse.json(processedTokens, {
			headers: {
				"Cache-Control": "public, s-maxage=5, stale-while-revalidate=59",
			},
		})
	} catch (error) {
		console.error("API error:", error)
		return NextResponse.json(
			{ error: "Failed to fetch tokens" },
			{ status: 500 }
		)
	}
}
