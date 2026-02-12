import { NextResponse } from "next/server"
import { fetchNoodlesMarketData } from "@/lib/noodles/client"
import type { TokenMarketData } from "@/types/token"

export const dynamic = "force-dynamic"

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ coin_type: string }> }
) {
	try {
		const { coin_type } = await params
		const coinType = decodeURIComponent(coin_type)

		const data = await fetchNoodlesMarketData(coinType)

		if (!data) {
			return NextResponse.json(
				{ coinPrice: 0 } as Partial<TokenMarketData>,
				{ status: 200 }
			)
		}

		return NextResponse.json(data, {
			headers: {
				"Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
			},
		})
	} catch (error) {
		console.error("Error fetching market data:", error)
		return NextResponse.json(
			{ coinPrice: 0 } as Partial<TokenMarketData>,
			{ status: 200 }
		)
	}
}
