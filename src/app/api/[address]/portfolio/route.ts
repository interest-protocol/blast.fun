import { NextRequest, NextResponse } from "next/server"
import { nexa } from "@/lib/nexa"

type Params = {
	params: Promise<{
		address: string
	}>
}

export async function GET(request: NextRequest, { params }: Params) {
	try {
		const { address } = await params
		const { searchParams } = new URL(request.url)
		const coinType = searchParams.get("coinType")

		if (!address) {
			return NextResponse.json({ error: "Address is required" }, { status: 400 })
		}

		const response = await nexa.server.fetchInternal(
			`/spot-portfolio/${address}?minBalanceValue=0`
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