import { NextResponse } from "next/server"
import { fetchNoodlesTokensWithBlastFilter } from "@/lib/noodles/fetch-tokens-with-blast-filter"

export const revalidate = 5

/**
 * Newly created tokens. Noodles coin-new + Blast filter only.
 */
export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url)
		const offset = Number(searchParams.get("offset") ?? 0)
		const limit = Number(searchParams.get("limit") ?? 20)

		const tokens = await fetchNoodlesTokensWithBlastFilter("coin-new", {
			pagination: { offset, limit },
			filters: {
				min_liquidity: searchParams.get("minLiquidity") ? Number(searchParams.get("minLiquidity")) : undefined,
				min_market_cap: searchParams.get("minMarketCap") ? Number(searchParams.get("minMarketCap")) : undefined,
				has_social: searchParams.get("hasSocial") === "true" ? true : undefined,
				verified: searchParams.get("verified") === "true" ? true : undefined,
			},
		})

		if (!tokens) {
			return NextResponse.json(
				{ error: "Noodles API key not configured. Set NOODLES_API_KEY in env." },
				{ status: 503 }
			)
		}

		return NextResponse.json(tokens, {
			headers: { "Cache-Control": "public, s-maxage=5, stale-while-revalidate=59" },
		})
	} catch (error) {
		console.error("API error:", error)
		return NextResponse.json({ error: "Failed to fetch tokens" }, { status: 500 })
	}
}
