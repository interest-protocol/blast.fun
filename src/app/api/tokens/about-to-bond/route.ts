import { NextResponse } from "next/server"
import { fetchNoodlesCoinList } from "@/lib/noodles/client"
import type { NoodlesCoinListParams } from "@/lib/noodles/client"
import { BLOCKED_COIN_TYPES } from "@/lib/noodles/blocked-coins"
import type { TokenListItem } from "@/types/token"

export const revalidate = 5

function toListItem(c: {
	coinType: string
	name: string
	symbol: string
	iconUrl: string
	decimals: number
	marketCap?: number
	volume24h?: number
}): TokenListItem {
	return {
		id: c.coinType,
		coinType: c.coinType,
		symbol: c.symbol,
		name: c.name,
		iconUrl: c.iconUrl,
		decimals: c.decimals,
		marketCap: c.marketCap,
		volume24h: c.volume24h,
	}
}

export async function GET() {
	try {
		const params: NoodlesCoinListParams = {
			pagination: { offset: 0, limit: 50 },
			orderBy: "bonding_curve_progress",
			orderDirection: "desc",
			filters: {
				protocol: ["blast-fun-bonding-curve"],
				isGraduated: false,
				bondingCurveProgressMin: 30,
			},
		}
		const res = await fetchNoodlesCoinList(params)
		if (!res?.data) {
			return NextResponse.json([], {
				headers: {
					"Cache-Control": "public, s-maxage=5, stale-while-revalidate=59",
				},
			})
		}
		const tokens: TokenListItem[] = res.data
			.filter((c) => !BLOCKED_COIN_TYPES.has(c.coinType))
			.map((c) =>
				toListItem({
					coinType: c.coinType,
					name: c.name,
					symbol: c.symbol,
					iconUrl: c.iconUrl,
					decimals: c.decimals,
					marketCap: c.marketCap,
					volume24h: c.volume24h,
				}),
			)
		return NextResponse.json(tokens, {
			headers: {
				"Cache-Control": "public, s-maxage=5, stale-while-revalidate=59",
			},
		})
	} catch (error) {
		console.error("Error fetching about-to-bond tokens:", error)
		return NextResponse.json([], {
			headers: {
				"Cache-Control": "public, s-maxage=5, stale-while-revalidate=59",
			},
		})
	}
}
