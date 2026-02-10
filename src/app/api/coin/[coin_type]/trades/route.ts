import { NextRequest, NextResponse } from "next/server"

const BLUEFIN_BASE = "https://spot.api.sui-prod.bluefin.io/internal-api/insidex"

export const revalidate = 5

/**
 * Trades for a coin. Proxies Bluefin server-side to avoid CORS from client.
 * Returns { trades: [], total: 0 } when token is Noodles-only or Bluefin fails.
 */
export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ coin_type: string }> }
) {
	const { coin_type } = await params
	const { searchParams } = new URL(_request.url)
	const limit = Math.min(Number(searchParams.get("limit")) || 20, 50)
	const skip = Number(searchParams.get("skip")) || 0

	if (!coin_type) {
		return NextResponse.json({ error: "Coin type is required" }, { status: 400 })
	}

	const decodedCoinType = decodeURIComponent(coin_type)

	try {
		const res = await fetch(
			`${BLUEFIN_BASE}/coins/${encodeURIComponent(decodedCoinType)}/trades?limit=${limit}&skip=${skip}`,
			{
				headers: { "Content-Type": "application/json" },
				next: { revalidate: 5 },
			}
		)

		if (!res.ok) {
			return NextResponse.json(
				{ trades: [], total: 0 },
				{
					headers: { "Cache-Control": "public, s-maxage=5, stale-while-revalidate=10" },
				}
			)
		}

		const data = await res.json()
		const trades = Array.isArray(data?.trades) ? data.trades : []
		const total = typeof data?.total === "number" ? data.total : trades.length

		return NextResponse.json(
			{ trades, total },
			{
				headers: { "Cache-Control": "public, s-maxage=5, stale-while-revalidate=10" },
			}
		)
	} catch (error) {
		console.error("Error fetching trades:", error)
		return NextResponse.json(
			{ trades: [], total: 0 },
			{
				headers: { "Cache-Control": "public, s-maxage=5, stale-while-revalidate=10" },
			}
		)
	}
}
