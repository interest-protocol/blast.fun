import { NextResponse } from "next/server"
import { coinMetadataApi } from "@/lib/coin-metadata-api"
import { fetchNoodlesCoinMetadata } from "@/lib/noodles/client"
import type { TokenMetadata } from "@/types/token"

const BLUEFIN_COIN_METADATA_BASE =
	"https://spot.api.sui-prod.bluefin.io/internal-api/insidex"

export const revalidate = 3600

/**
 * Coin metadata (TokenMetadata). Noodles coin-detail first, then coinMetadataApi, then Bluefin.
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
		const noodlesMeta = await fetchNoodlesCoinMetadata(decodedCoinType)
		if (noodlesMeta) {
			return NextResponse.json(noodlesMeta, {
				headers: {
					"Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
				},
			})
		}

		const fallbackMeta = await coinMetadataApi.getCoinMetadata(decodedCoinType)
		if (fallbackMeta) {
			const mapped: TokenMetadata = {
				name: fallbackMeta.name,
				symbol: fallbackMeta.symbol,
				description: fallbackMeta.description ?? "",
				icon_url: fallbackMeta.iconUrl,
				decimals: fallbackMeta.decimals,
				supply: 0,
			}
			return NextResponse.json(mapped, {
				headers: {
					"Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
				},
			})
		}

		const bluefinRes = await fetch(
			`${BLUEFIN_COIN_METADATA_BASE}/coins/${encodeURIComponent(decodedCoinType)}/coin-metadata`,
			{ headers: { Accept: "application/json" }, next: { revalidate: 21600 } }
		)

		if (!bluefinRes.ok) {
			return NextResponse.json(
				{ error: "Metadata not found" },
				{ status: bluefinRes.status }
			)
		}

		const bluefinData = (await bluefinRes.json()) as TokenMetadata
		return NextResponse.json(bluefinData, {
			headers: {
				"Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
			},
		})
	} catch (error) {
		console.error("Error fetching coin metadata:", error)
		return NextResponse.json(
			{ error: "Failed to fetch metadata" },
			{ status: 500 }
		)
	}
}
