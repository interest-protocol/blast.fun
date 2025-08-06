import { NextRequest, NextResponse } from "next/server"
import { nexa } from "@/lib/nexa"

interface Params {
	params: Promise<{
		coinType: string
	}>
}

export async function GET(request: NextRequest, { params }: Params) {
	try {
		const { coinType } = await params
		const decodedCoinType = decodeURIComponent(coinType)

		const { searchParams } = new URL(request.url)
		const limit = searchParams.get("limit") || "20"
		const skip = searchParams.get("skip") || "0"

		const holdersResponse = await nexa.server.fetch(`/coin-holders/${decodedCoinType}/holders?limit=${limit}&skip=${skip}`)
		if (!holdersResponse.ok) {
			console.error(`Holders API error: ${holdersResponse.status} for coin ${decodedCoinType}`)
			throw new Error("Failed to fetch holders")
		}

		const holders = await holdersResponse.json()
		const holdersWithPortfolio = await Promise.all(
			holders.map(async (holder: any) => {
				try {
					const portfolioResponse = await nexa.server.fetchInternal(
						`/spot-portfolio/${holder.user}?minBalanceValue=0`
					)

					if (portfolioResponse.ok) {
						const portfolioData = await portfolioResponse.json()
						const coinBalance = portfolioData.balances?.find((b: any) => b.coinType === decodedCoinType)

						if (coinBalance && coinBalance.marketStats) {
							return {
								...holder,
								marketStats: coinBalance.marketStats,
								averageEntryPrice: coinBalance.averageEntryPrice || 0,
								unrealizedPnl: coinBalance.unrealizedPnl || 0,
								realizedPnl: coinBalance.marketStats?.pnl || 0
							}
						}
					}
				} catch (error) {
					console.error(`Error fetching portfolio for user ${holder.user}:`, error)
				}

				return holder
			})
		)

		return NextResponse.json(holdersWithPortfolio)
	} catch (error) {
		console.error("Error fetching holders with portfolio:", error)
		return NextResponse.json(
			{ error: "Failed to fetch holders with portfolio" },
			{ status: 500 }
		)
	}
}