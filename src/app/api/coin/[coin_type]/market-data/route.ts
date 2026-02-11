import { NextResponse } from "next/server"
import { fetchNoodlesMarketData } from "@/lib/noodles/client"

export const revalidate = 10

/**
 * Market data for a single coin. Noodles (coin-detail + coin-price-volume) only.
 */
export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ coin_type: string }> }
) {
	const { coin_type } = await params

	if (!coin_type) {
		return NextResponse.json({ error: "Coin type is required" }, { status: 400 })
	}

	const decodedCoinType = decodeURIComponent(coin_type)

	try {
		const noodlesData = await fetchNoodlesMarketData(decodedCoinType)
		if (!noodlesData) {
			return NextResponse.json(
				{ error: "Market data not available" },
				{ status: 404 }
			)
		}
		return NextResponse.json(noodlesData, {
			headers: {
				"Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
			},
		})
	} catch (error) {
		console.error("Error fetching market data:", error)
		return NextResponse.json(
			{ error: "Failed to fetch market data" },
			{ status: 500 }
		)
	}
}
