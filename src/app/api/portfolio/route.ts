import { NextRequest, NextResponse } from "next/server"
import { env } from "@/env"

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const address = searchParams.get("address")
		const coinType = searchParams.get("coinType")

		if (!address) {
			return NextResponse.json({ error: "Address is required" }, { status: 400 })
		}

		const response = await fetch(
			`https://api-ex.insidex.trade/spot-portfolio/${address}?minBalanceValue=0`,
			{
				headers: {
					"x-api-key": env.NEXA_API_KEY,
					"Content-Type": "application/json",
				},
			}
		)

		if (!response.ok) {
			throw new Error(`Failed to fetch portfolio: ${response.statusText}`)
		}

		const data = await response.json()
		// coinType is specified, return only that balance
		if (coinType) {
			const balance = data.balances.find((b: any) => b.coinType === coinType)
			return NextResponse.json({ balance: balance?.balance || "0" })
		}

		// return full portfolio
		return NextResponse.json(data)
	} catch (error) {
		console.error("Portfolio fetch error:", error)
		return NextResponse.json(
			{ error: "Failed to fetch portfolio" },
			{ status: 500 }
		)
	}
}