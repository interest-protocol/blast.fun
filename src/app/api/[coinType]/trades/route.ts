import { NextRequest, NextResponse } from "next/server"
import { nexa } from "@/lib/nexa"

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ coinType: string }> }
) {
	try {
		const { coinType } = await params
		const { searchParams } = new URL(request.url)
		
		const limit = searchParams.get("limit") || "20"
		const skip = searchParams.get("skip") || "0"
		
		const decodedCoinType = decodeURIComponent(coinType)
		
		const response = await nexa.server.fetch(
			`/spot-trades/${decodedCoinType}/coin-trades?limit=${limit}&skip=${skip}`
		)
		
		if (!response.ok) {
			return NextResponse.json(
				{ error: "Failed to fetch trades from upstream" },
				{ status: response.status }
			)
		}
		
		const trades = await response.json()
		
		return NextResponse.json(trades)
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to fetch trades" },
			{ status: 500 }
		)
	}
}