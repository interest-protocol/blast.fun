import { NextResponse } from "next/server"
import { fetchNoodlesCoinDetail } from "@/lib/noodles/client"
import { fetchCreatorData } from "@/lib/fetch-creator-data"
import type { TokenCreator } from "@/types/token"

export const revalidate = 60

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ coin_type: string }> }
) {
	try {
		const { coin_type } = await params
		const coinType = decodeURIComponent(coin_type)

		const detail = await fetchNoodlesCoinDetail(coinType)
		const creatorAddress = detail?.data?.coin?.creator ?? null

		if (!creatorAddress) {
			return NextResponse.json({ creator: null }, { status: 404 })
		}

		let creatorData: TokenCreator
		try {
			creatorData = await fetchCreatorData({
				creatorAddressOrHandle: creatorAddress,
			})
			if (!creatorData.address) {
				creatorData = { ...creatorData, address: creatorAddress }
			}
		} catch {
			creatorData = {
				address: creatorAddress,
				launchCount: 0,
				trustedFollowers: "0",
				followers: "0",
				twitterHandle: null,
				twitterId: null,
				hideIdentity: false,
			}
		}

		const creator: TokenCreator = {
			address: creatorData.address,
			launchCount: creatorData.launchCount,
			trustedFollowers: creatorData.trustedFollowers,
			followers: creatorData.followers,
			twitterHandle: creatorData.twitterHandle,
			twitterId: creatorData.twitterId,
			hideIdentity: creatorData.hideIdentity,
		}

		return NextResponse.json({ creator })
	} catch (error) {
		console.error("Error fetching creator for coin:", error)
		return NextResponse.json({ creator: null }, { status: 500 })
	}
}
