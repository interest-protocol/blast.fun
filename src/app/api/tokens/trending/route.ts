import { NextResponse } from "next/server"
import { fetchNoodlesCoinTrending } from "@/lib/noodles/client"
import type { NoodlesCoinTrendingPeriod } from "@/lib/noodles/types"

export const revalidate = 60

const VALID_PERIODS: NoodlesCoinTrendingPeriod[] = ["30m", "1h", "4h", "6h", "24h"]

/**
 * Trending coins from Noodles coin-trending only.
 */
export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url)
		const period = (searchParams.get("period") ?? "24h") as NoodlesCoinTrendingPeriod
		const limit = Math.min(Number(searchParams.get("limit") ?? 30), 200)
		const offset = Number(searchParams.get("offset") ?? 0)

		if (!VALID_PERIODS.includes(period)) {
			return NextResponse.json(
				{ error: `Invalid period. Use one of: ${VALID_PERIODS.join(", ")}` },
				{ status: 400 }
			)
		}

		const data = await fetchNoodlesCoinTrending(period, { limit, offset })

		return NextResponse.json(data, {
			headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
		})
	} catch (error) {
		console.error("API error:", error)
		return NextResponse.json({ error: "Failed to fetch trending" }, { status: 500 })
	}
}
