import { NextRequest, NextResponse } from "next/server"
import { blockVisionService } from "@/services/blockvision.service"

export async function POST(req: NextRequest) {
	try {
		const { address } = await req.json()

		if (!address) {
			return NextResponse.json({ error: "Address is required" }, { status: 400 })
		}

		// Use BlockVision service to fetch wallet coins
		const result = await blockVisionService.getAccountCoins(address)

		if (!result.success || !result.data) {
			console.error("Failed to fetch wallet coins:", result.error)
			return NextResponse.json({ error: result.error || "Failed to fetch wallet coins" }, { status: 500 })
		}

		// Return the coins in the expected format
		return NextResponse.json({
			coins: result.data,
			success: true,
		})
	} catch (error) {
		console.error("Error in wallet coins API:", error)
		return NextResponse.json({ error: "Failed to fetch wallet coins" }, { status: 500 })
	}
}

// Also support GET for easier testing
export async function GET(req: NextRequest) {
	const searchParams = req.nextUrl.searchParams
	const address = searchParams.get("address")

	if (!address) {
		return NextResponse.json({ error: "Address is required" }, { status: 400 })
	}

	// Use BlockVision service to fetch wallet coins
	const result = await blockVisionService.getAccountCoins(address)

	if (!result.success || !result.data) {
		console.error("Failed to fetch wallet coins:", result.error)
		return NextResponse.json({ error: result.error || "Failed to fetch wallet coins" }, { status: 500 })
	}

	return NextResponse.json({
		coins: result.data,
		success: true,
	})
}
