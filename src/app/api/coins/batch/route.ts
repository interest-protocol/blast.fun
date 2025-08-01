import { NextRequest, NextResponse } from "next/server"
import { nexa } from "@/lib/nexa"

export async function POST(request: NextRequest) {
	try {
		const { coinTypes } = await request.json()

		if (!Array.isArray(coinTypes) || coinTypes.length === 0) {
			return NextResponse.json(
				{ error: "coinTypes must be a non-empty array" },
				{ status: 400 }
			)
		}

		const coinTypesString = coinTypes.join(',')
		try {
			const response = await nexa.server.fetch(`/coins/multiple/market-data?coins=${encodeURIComponent(coinTypesString)}`)

			if (!response.ok) {
				console.error(`Failed to batch fetch coin data: ${response.status}`)
				return NextResponse.json({})
			}

			const data = await response.json()
			const coinsMap: Record<string, any> = {}
			const coinsArray = Array.isArray(data) ? data : [data]

			coinsArray.forEach((coin: any) => {
				if (coin && coin.coin && coin.coinMetadata) {
					const metadata = {
						...coin.coinMetadata,
						decimals: Number(coin.coinMetadata.decimals) || 9
					}
					coinsMap[coin.coin] = metadata
				}
			})

			return NextResponse.json(coinsMap)
		} catch (error) {
			console.error("Error in batch fetch:", error)
			return NextResponse.json({})
		}
	} catch (error) {
		console.error("Error batch fetching coins:", error)
		return NextResponse.json(
			{ error: "Failed to batch fetch coins" },
			{ status: 500 }
		)
	}
}