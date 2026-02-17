import { NextResponse } from "next/server"
import { fetchNoodlesCoinDetail } from "@/lib/noodles/client"
import type { TokenMetadata } from "@/types/token"

export const revalidate = 60

function noodlesToTokenMetadata(detail: NonNullable<Awaited<ReturnType<typeof fetchNoodlesCoinDetail>>>): TokenMetadata | null {
	const coin = detail?.data?.coin
	if (!coin) return null
	const social = detail?.data?.social_media ?? {}
	return {
		name: coin.name ?? "",
		symbol: coin.symbol ?? "",
		description: coin.description ?? "",
		icon_url: coin.logo ?? "",
		decimals: coin.decimals ?? 9,
		supply: 0,
		Website: social.website ?? undefined,
		X: social.x ?? undefined,
		Discord: social.discord ?? undefined,
	}
}

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ coin_type: string }> }
) {
	try {
		const { coin_type } = await params
		const coinType = decodeURIComponent(coin_type)
		const detail = await fetchNoodlesCoinDetail(coinType)
		const metadata = detail ? noodlesToTokenMetadata(detail) : null
		if (!metadata) {
			return NextResponse.json({ error: "Coin not found" }, { status: 404 })
		}
		return NextResponse.json(metadata, {
			headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
		})
	} catch (error) {
		console.error("Error fetching coin metadata:", error)
		return NextResponse.json({ error: "Internal server error" }, { status: 500 })
	}
}
