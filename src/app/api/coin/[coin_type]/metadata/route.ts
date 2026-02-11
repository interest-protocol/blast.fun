import { NextResponse } from "next/server"
import { fetchNoodlesCoinMetadata } from "@/lib/noodles/client"

export const revalidate = 3600

/**
 * Coin metadata. Noodles coin-detail only.
 */
export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ coin_type: string }> }
) {
	const { coin_type } = await params

	if (!coin_type) {
		return NextResponse.json({ error: "Coin type is required" }, { status: 400 })
	}

	const decodedCoinType = decodeURIComponent(coin_type)

	try {
		const meta = await fetchNoodlesCoinMetadata(decodedCoinType)
		if (meta) {
			return NextResponse.json(meta, {
				headers: {
					"Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
				},
			})
		}

		return NextResponse.json(
			{ error: "Metadata not found" },
			{ status: 404 }
		)
	} catch (error) {
		console.error("Error fetching coin metadata:", error)
		return NextResponse.json(
			{ error: "Failed to fetch metadata" },
			{ status: 500 }
		)
	}
}
