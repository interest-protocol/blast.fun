import { NextResponse } from "next/server"
import { fetchNoodlesPortfolio } from "@/lib/noodles/client"

export const revalidate = 30

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ address: string; coin_type: string }> }
) {
	const { address, coin_type: coinType } = await params
	if (!address || !coinType) {
		return NextResponse.json(
			{ error: "address and coin_type required" },
			{ status: 400 }
		)
	}

	const decodedCoinType = decodeURIComponent(coinType)

	try {
		const portfolio = await fetchNoodlesPortfolio(decodeURIComponent(address))
		const coin = portfolio?.data?.find(
			(c) => c.coin_type === decodedCoinType
		)

		if (!coin || coin.amount <= 0) {
			const emptyStats = {
				_id: "",
				user: address,
				coin: decodedCoinType,
				amountBought: 0,
				amountSold: 0,
				buyTrades: 0,
				currentHolding: 0,
				pnl: 0,
				sellTrades: 0,
				usdBought: 0,
				usdSold: 0
			}
			return NextResponse.json(emptyStats, {
				headers: {
					"Cache-Control": "public, s-maxage=30, stale-while-revalidate=60"
				}
			})
		}

		const decimals = coin.decimals ?? 9
		const rawAmount = Math.round(coin.amount * Math.pow(10, decimals))
		const usdBought = coin.usd_value
		const pnl = coin.pnl_today ?? 0

		const stats = {
			_id: `${address}-${decodedCoinType}`,
			user: address,
			coin: decodedCoinType,
			amountBought: rawAmount,
			amountSold: 0,
			buyTrades: 1,
			currentHolding: rawAmount,
			pnl,
			sellTrades: 0,
			usdBought,
			usdSold: 0
		}

		return NextResponse.json(stats, {
			headers: {
				"Cache-Control": "public, s-maxage=30, stale-while-revalidate=60"
			}
		})
	} catch (error) {
		console.error("Error fetching market stats:", error)
		const emptyStats = {
			_id: "",
			user: address,
			coin: decodedCoinType,
			amountBought: 0,
			amountSold: 0,
			buyTrades: 0,
			currentHolding: 0,
			pnl: 0,
			sellTrades: 0,
			usdBought: 0,
			usdSold: 0
		}
		return NextResponse.json(emptyStats, {
			headers: {
				"Cache-Control": "public, s-maxage=10, stale-while-revalidate=30"
			}
		})
	}
}
