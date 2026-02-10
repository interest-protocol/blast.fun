import { NextResponse } from "next/server"

/**
 * Per-user per-coin market stats (PnL, buy/sell counts). Noodles has no equivalent;
 * returns empty stats so UI shows zeros instead of calling Nexa.
 */
export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ address: string; coin_type: string }> }
) {
	const { address, coin_type: coinType } = await params
	if (!address || !coinType) {
		return NextResponse.json({ error: "address and coin_type required" }, { status: 400 })
	}

	const emptyStats = {
		_id: "",
		user: address,
		coin: decodeURIComponent(coinType),
		amountBought: 0,
		amountSold: 0,
		buyTrades: 0,
		currentHolding: 0,
		pnl: 0,
		sellTrades: 0,
		usdBought: 0,
		usdSold: 0,
	}

	return NextResponse.json(emptyStats, {
		headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
	})
}
