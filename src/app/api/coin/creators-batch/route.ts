import { NextResponse } from "next/server"
import { fetchNoodlesCoinDetail } from "@/lib/noodles/client"
import { fetchCreatorData } from "@/lib/fetch-creator-data"
import type { TokenCreator } from "@/types/token"

export const revalidate = 60

const MAX_COIN_TYPES = 50

export async function POST(request: Request) {
	try {
		const body = await request.json().catch(() => ({}))
		const coinTypes = Array.isArray(body.coinTypes)
			? (body.coinTypes as string[]).slice(0, MAX_COIN_TYPES)
			: []

		if (coinTypes.length === 0) {
			return NextResponse.json({ creators: {} })
		}

		const details = await Promise.all(
			coinTypes.map((coinType) =>
				fetchNoodlesCoinDetail(coinType).then((d) => ({
					coinType,
					creatorAddress: d?.data?.coin?.creator ?? null,
				}))
			)
		)

		const coinToAddress = new Map<string, string>()
		for (const { coinType, creatorAddress } of details) {
			if (creatorAddress) coinToAddress.set(coinType, creatorAddress)
		}

		const uniqueAddresses = [...new Set(coinToAddress.values())]
		const creatorDataByAddress = new Map<string, TokenCreator>()

		await Promise.all(
			uniqueAddresses.map(async (address) => {
				try {
					const data = await fetchCreatorData({
						creatorAddressOrHandle: address,
					})
					creatorDataByAddress.set(address, {
						address: data.address || address,
						launchCount: data.launchCount,
						trustedFollowers: data.trustedFollowers,
						followers: data.followers,
						twitterHandle: data.twitterHandle,
						twitterId: data.twitterId,
						hideIdentity: data.hideIdentity,
					})
				} catch {
					creatorDataByAddress.set(address, {
						address,
						launchCount: 0,
						trustedFollowers: "0",
						followers: "0",
						twitterHandle: null,
						twitterId: null,
						hideIdentity: false,
					})
				}
			})
		)

		const creators: Record<string, TokenCreator> = {}
		for (const [coinType, address] of coinToAddress) {
			const data = creatorDataByAddress.get(address)
			if (data) creators[coinType] = data
		}

		return NextResponse.json(
			{ creators },
			{
				headers: {
					"Cache-Control":
						"public, s-maxage=60, stale-while-revalidate=120",
				},
			}
		)
	} catch (error) {
		console.error("Creators batch error:", error)
		return NextResponse.json(
			{ creators: {} },
			{ status: 500 }
		)
	}
}
