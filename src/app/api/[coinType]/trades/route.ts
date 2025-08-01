import { NextRequest, NextResponse } from "next/server"
import { nexa } from "@/lib/nexa"
import { TradeData } from "@/types/trade"
import { env } from "@/env"

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
		const limit = searchParams.get("limit") || "100"
		const skip = searchParams.get("skip") || "0"

		const endTime = Date.now()
		const startTime = endTime - (24 * 60 * 60 * 1000)

		const [buyResponse, sellResponse] = await Promise.all([
			nexa.server.fetch(`/spot-trades/${decodedCoinType}/buy-trades?startTime=${startTime}&endTime=${endTime}`),
			nexa.server.fetch(`/spot-trades/${decodedCoinType}/sell-trades?startTime=${startTime}&endTime=${endTime}`)
		])

		if (!buyResponse.ok || !sellResponse.ok) {
			console.error(`Trades API error: Buy ${buyResponse.status}, Sell ${sellResponse.status} for coin ${decodedCoinType}`)
			throw new Error("Failed to fetch trades")
		}

		const buyTrades: TradeData[] = await buyResponse.json()
		const sellTrades: TradeData[] = await sellResponse.json()

		const allTrades = [...buyTrades, ...sellTrades]
			.filter(trade => trade.platform === "xpump" || !trade.platform)
			.sort((a, b) => b.timestampMs - a.timestampMs)

		const paginatedTrades = allTrades.slice(
			parseInt(skip),
			parseInt(skip) + parseInt(limit)
		)

		const uniqueCoinTypes = new Set<string>()
		paginatedTrades.forEach(trade => {
			uniqueCoinTypes.add(trade.coinIn)
			uniqueCoinTypes.add(trade.coinOut)
		})

		let coinsData: Record<string, any> = {}
		try {
			const response = await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/coins/batch`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ coinTypes: Array.from(uniqueCoinTypes) })
			})

			if (response.ok) {
				coinsData = await response.json()
				console.log("Fetched coin metadata for", Object.keys(coinsData).length, "coins")
				console.log("Sample coin metadata:", Object.entries(coinsData).slice(0, 2))
			} else {
				const errorText = await response.text()
				console.warn("Failed to batch fetch coin data:", response.status, errorText)
			}
		} catch (error) {
			console.warn("Error batch fetching coin data:", error)
			// continue without metadata
		}

		const tradesWithMetadata = paginatedTrades.map(({ platform, ...trade }) => ({
			...trade,
			coinInMetadata: coinsData[trade.coinIn] || null,
			coinOutMetadata: coinsData[trade.coinOut] || null,
		}))

		return NextResponse.json(tradesWithMetadata)
	} catch (error) {
		console.error("Error fetching trades:", error)
		return NextResponse.json(
			{ error: "Failed to fetch trades" },
			{ status: 500 }
		)
	}
}