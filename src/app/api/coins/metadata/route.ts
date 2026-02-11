import { NextResponse } from "next/server"
import { fetchNoodlesCoinMetadata } from "@/lib/noodles/client"

export const revalidate = 3600

/**
 * Batch coin metadata. Noodles coin-detail only. Returns array of metadata (null for not found).
 */
export async function POST(request: Request) {
	try {
		const body = (await request.json()) as { coinTypes?: string[] }
		const coinTypes = Array.isArray(body?.coinTypes) ? body.coinTypes : []
		if (coinTypes.length === 0) {
			return NextResponse.json([])
		}

		const results = await Promise.all(
			coinTypes.map(async (ct) => ({ coinType: ct, meta: await fetchNoodlesCoinMetadata(ct) }))
		)
		const mapped = results.map(({ coinType, meta: m }) =>
			m
				? {
						id: coinType,
						decimals: m.decimals,
						name: m.name,
						symbol: m.symbol,
						description: m.description ?? "",
						iconUrl: m.icon_url,
						type: coinType,
					}
				: null
		)

		return NextResponse.json(mapped, {
			headers: {
				"Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
			},
		})
	} catch (error) {
		console.error("Error fetching batch coin metadata:", error)
		return NextResponse.json(
			{ error: "Failed to fetch metadata" },
			{ status: 500 }
		)
	}
}
