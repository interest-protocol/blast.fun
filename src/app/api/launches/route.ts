import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

import { suiGrpcClient } from "@/lib/sui-grpc"

export async function POST(request: NextRequest) {
	try {
		// @dev: Get authenticated user from session
		const session = await auth()
		
		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized - Please login first" }, { status: 401 })
		}

		const body = await request.json()

		const {
			poolObjectId,
			creatorAddress,
			hideIdentity,
			tokenTxHash,
			poolTxHash,
			protectionSettings
		} = body

		// @dev: Use session data instead of request body for user info
		const twitterUserId = session.user.twitterId
		const twitterUsername = session.user.username

		if (!poolObjectId || !creatorAddress || !tokenTxHash || !poolTxHash) {
			return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
		}

		if (!twitterUserId || !twitterUsername) {
			return NextResponse.json({ error: "Twitter authentication required" }, { status: 401 })
		}
		
		let coinType = ""
		try {
			const result = await suiGrpcClient.waitForTransaction({
				digest: tokenTxHash,
				include: { effects: true, objectTypes: true },
			})
			const tx = result.Transaction ?? result.FailedTransaction

			// Look for TreasuryCap creation to extract coinType
			tx.effects.changedObjects.forEach((change) => {
				// @dev: gRPC reports 0x2 as a full 32-byte address, so match on the module path instead.
				const match = /::coin::TreasuryCap<(.+)>$/.exec(tx.objectTypes[change.objectId] ?? "")
				if (change.idOperation === "Created" && match) {
					coinType = match[1]
				}
			})
		} catch (error) {
			console.error("Failed to fetch coinType from transaction:", error)
			// Continue without coinType - it can be updated later via the debug endpoint
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
				coinType,
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
