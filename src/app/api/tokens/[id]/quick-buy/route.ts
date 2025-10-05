import { NextRequest, NextResponse } from "next/server"
import { apolloClient } from "@/lib/apollo-client"
import { CONFIG_KEYS } from "@interest-protocol/memez-fun-sdk"
import { GET_POOL_QUICK_BUY } from "@/graphql/pools"

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params

		if (!id) {
			return NextResponse.json(
				{ error: "Coin type is required" },
				{ status: 400 }
			)
		}

		const decodedCoinType = decodeURIComponent(id)

		const { data } = await apolloClient.query({
			query: GET_POOL_QUICK_BUY,
			variables: { type: decodedCoinType },
			context: {
				headers: {
					"config-key": CONFIG_KEYS.mainnet.XPUMP,
				},
			},
			fetchPolicy: "cache-first",
		})

		if (!data?.coinPool) {
			return NextResponse.json(
				{ error: "Pool not found" },
				{ status: 404 }
			)
		}

		const pool = data.coinPool

		const quickBuyData = {
			poolId: pool.poolId,
			decimals: pool.metadata?.decimals || 9,
			symbol: pool.metadata?.symbol || "TOKEN",
		}

		return NextResponse.json(quickBuyData, {
			headers: {
				"Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
				"CDN-Cache-Control": "max-age=60",
				"X-Cache-Source": "quick-buy",
			},
		})
	} catch (error) {
		console.error("Failed to fetch quick buy data:", error)
		return NextResponse.json(
			{ error: "Failed to fetch pool data" },
			{ status: 500 }
		)
	}
}
