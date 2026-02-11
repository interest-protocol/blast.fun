import { NextResponse } from "next/server"
import {
	fetchNoodlesPortfolio,
	type NoodlesPortfolioCoin,
} from "@/lib/noodles/client"
import type { PortfolioBalanceItem } from "@/types/portfolio"

export const revalidate = 30

function mapNoodlesCoinToBalance(item: NoodlesPortfolioCoin): PortfolioBalanceItem {
	return {
		coinType: item.coin_type,
		balance: String(item.amount),
		price: item.price,
		value: item.usd_value,
		unrealizedPnl: item.pnl_today ?? 0,
		averageEntryPrice: 0,
		coinMetadata: {
			id: item.coin_type,
			coinType: item.coin_type,
			name: item.symbol,
			symbol: item.symbol,
			decimals: item.decimals,
			icon_url: item.icon_url ?? undefined,
			iconUrl: item.icon_url ?? undefined,
		},
	}
}

/**
 * Portfolio balances for an address. Noodles portfolio/coins only.
 */
export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ address: string }> }
) {
	const { address } = await params

	if (!address) {
		return NextResponse.json(
			{ error: "Address is required" },
			{ status: 400 }
		)
	}

	const decodedAddress = decodeURIComponent(address)

	try {
		const noodlesRes = await fetchNoodlesPortfolio(decodedAddress)
		const balances =
			noodlesRes?.data && Array.isArray(noodlesRes.data)
				? noodlesRes.data.map(mapNoodlesCoinToBalance)
				: []
		return NextResponse.json(
			{ balances },
			{
				headers: {
					"Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
				},
			}
		)
	} catch (error) {
		console.error("Error fetching portfolio:", error)
		return NextResponse.json(
			{ balances: [] },
			{
				status: 200,
				headers: {
					"Cache-Control":
						"public, s-maxage=10, stale-while-revalidate=30",
				},
			}
		)
	}
}
