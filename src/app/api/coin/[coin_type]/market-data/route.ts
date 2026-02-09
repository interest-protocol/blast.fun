import { NextResponse } from "next/server"
import { fetchNoodlesMarketData } from "@/lib/noodles/client"

const BLUEFIN_MINIFIED_MARKET_DATA_BASE =
	"https://spot.api.sui-prod.bluefin.io/internal-api/insidex"

export const revalidate = 10

/**
 * Market data for a single coin. Noodles (coin-detail + coin-price-volume) first,
 * then Bluefin minified-market-data as fallback when Noodles key is missing or fails.
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
		if (noodlesData) {
			return NextResponse.json(noodlesData, {
				headers: {
					"Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
				},
			})
		}

		const bluefinRes = await fetch(
			`${BLUEFIN_MINIFIED_MARKET_DATA_BASE}/coins/${encodeURIComponent(decodedCoinType)}/minified-market-data`,
			{
				headers: { "Content-Type": "application/json" },
				next: { revalidate: 10 },
			}
		)

		if (!bluefinRes.ok) {
			return NextResponse.json(
				{ error: "Market data not available" },
				{ status: bluefinRes.status }
			)
		}

		const bluefinData = await bluefinRes.json()
		return NextResponse.json(bluefinData, {
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
