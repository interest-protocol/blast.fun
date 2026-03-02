import { NextRequest, NextResponse } from "next/server"
import { fetchNoodlesPortfolio, type NoodlesPortfolioCoin } from "@/lib/noodles/client"
import type { WalletCoin } from "@/types/blockvision"

const mapNoodlesToWalletCoins = (coins: NoodlesPortfolioCoin[] | undefined | null): WalletCoin[] => {
	if (!coins || !Array.isArray(coins)) return []

	return coins
		.filter((c) => c.amount > 0)
		.map((c) => ({
			coinType: c.coin_type,
			balance: String(c.amount),
			decimals: c.decimals ?? 9,
			symbol: c.symbol,
			name: c.symbol,
			iconUrl: c.icon_url ?? undefined,
			price: c.price,
			value: c.usd_value,
			verified: c.verified,
			scam: false,
		}))
}

export async function POST(req: NextRequest) {
	try {
		const { address } = await req.json()
		if (!address) {
			return NextResponse.json(
				{ error: "Address is required" },
				{ status: 400 }
			)
		}

		const noodlesRes = await fetchNoodlesPortfolio(address)
		if (!noodlesRes || !noodlesRes.data) {
			console.error("Failed to fetch wallet coins from Noodles:", noodlesRes?.message)
			return NextResponse.json({
				coins: [],
				success: true,
			})
		}

		const coins = mapNoodlesToWalletCoins(noodlesRes.data)

		return NextResponse.json({
			coins,
			success: true,
		})
	} catch (error) {
		console.error("Error in wallet coins API (Noodles):", error)
		return NextResponse.json({
			coins: [],
			success: true,
		})
	}
}

export async function GET(req: NextRequest) {
	const searchParams = req.nextUrl.searchParams
	const address = searchParams.get("address")
	if (!address) {
		return NextResponse.json(
			{ error: "Address is required" },
			{ status: 400 }
		)
	}

	try {
		const noodlesRes = await fetchNoodlesPortfolio(address)
		if (!noodlesRes || !noodlesRes.data) {
			console.error("Failed to fetch wallet coins from Noodles:", noodlesRes?.message)
			return NextResponse.json({
				coins: [],
				success: true,
			})
		}

		const coins = mapNoodlesToWalletCoins(noodlesRes.data)

		return NextResponse.json({
			coins,
			success: true,
		})
	} catch (error) {
		console.error("Error in wallet coins API (Noodles):", error)
		return NextResponse.json({
			coins: [],
			success: true,
		})
	}
}