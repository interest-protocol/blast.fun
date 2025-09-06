import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
	try {
		// @dev: Get authenticated user from session
		const session = await auth()

		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized - Please login first" }, { status: 401 })
		}

		const body = await request.json()

		const { poolObjectId, creatorAddress, hideIdentity, tokenTxHash, poolTxHash, protectionSettings } = body

		// @dev: Use session data instead of request body for user info
		const twitterUserId = session.user.twitterId
		const twitterUsername = session.user.username

		if (!poolObjectId || !creatorAddress || !tokenTxHash || !poolTxHash) {
			return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
		}

		if (!twitterUserId || !twitterUsername) {
			return NextResponse.json({ error: "Twitter authentication required" }, { status: 401 })
		}

		const tokenLaunch = await prisma.tokenLaunches.create({
			data: {
				poolObjectId,
				creatorAddress,
				twitterUserId,
				twitterUsername,
				hideIdentity: hideIdentity || false,
				tokenTxHash,
				poolTxHash,
			},
		})

		if (protectionSettings) {
			await prisma.tokenProtectionSettings.create({
				data: {
					poolId: poolObjectId,
					settings: {
						sniperProtection: protectionSettings.sniperProtection || false,
						requireTwitter: protectionSettings.requireTwitter || false,
						revealTraderIdentity: protectionSettings.revealTraderIdentity || false,
						minFollowerCount: protectionSettings.minFollowerCount || null,
						maxHoldingPercent: protectionSettings.maxHoldingPercent || null,
					},
				},
			})
		}

		return NextResponse.json({ success: true, id: tokenLaunch.id })
	} catch (error) {
		console.error("Error saving token launch:", error)
		return NextResponse.json({ error: "Failed to save token launch data" }, { status: 500 })
	}
}
