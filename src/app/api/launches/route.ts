import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client"

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
		
		// Get coinType from the tokenTxHash using SuiClient
		const client = new SuiClient({ url: getFullnodeUrl("mainnet") })
		let coinType = ""
		
		try {
			const tx = await client.waitForTransaction({ 
				digest: tokenTxHash, 
				options: { showObjectChanges: true } 
			})
			
			// Look for TreasuryCap creation to extract coinType
			tx.objectChanges?.forEach((change) => {
				if (
					change.type === "created" &&
					typeof change.objectType === "string" &&
					change.objectType.startsWith("0x2::coin::TreasuryCap<")
				) {
					coinType = change.objectType.split("<")[1].split(">")[0]
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
