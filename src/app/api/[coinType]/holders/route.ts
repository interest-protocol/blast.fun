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
		const limit = searchParams.get("limit") || "100"
		const skip = searchParams.get("skip") || "0"

		const response = await nexa.server.fetch(`/coin-holders/${decodedCoinType}/holders?limit=${limit}&skip=${skip}`)
		if (!response.ok) {
			console.error(`Holders API error: ${response.status} for coin ${decodedCoinType}`)
			throw new Error("Failed to fetch holders")
		}

		const data = await response.json()
		return NextResponse.json(data)
	} catch (error) {
		console.error("Error fetching holders:", error)
		return NextResponse.json(
			{ error: "Failed to fetch holders" },
			{ status: 500 }
		)
	}
}