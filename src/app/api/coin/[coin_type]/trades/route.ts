import { NextRequest, NextResponse } from "next/server"

export const revalidate = 5

/**
 * Trades for a coin. Noodles has pool-level trade events (pool_address), not coin-level;
 * returns empty list until we have a Noodles-based source for coin trades.
 */
export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ coin_type: string }> }
) {
	const { coin_type } = await params

	if (!coin_type) {
		return NextResponse.json({ error: "Coin type is required" }, { status: 400 })
	}

	return NextResponse.json(
		{ trades: [], total: 0 },
		{
			headers: { "Cache-Control": "public, s-maxage=5, stale-while-revalidate=10" },
		}
	)
}
