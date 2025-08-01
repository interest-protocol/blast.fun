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

		const response = await nexa.server.fetch(`/coins/${decodedCoinType}/market-data`)
		if (!response.ok) {
			console.error(`Market data API error: ${response.status} for coin ${decodedCoinType}`)
			throw new Error("Failed to fetch market data")
		}

		const data = await response.json()
		return NextResponse.json(data[0])
	} catch (error) {
		console.error("Error fetching market data:", error)
		return NextResponse.json(
			{ error: "Failed to fetch market data" },
			{ status: 500 }
		)
	}
}