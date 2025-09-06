import { bcs } from "@mysten/sui/bcs"
import { MIST_PER_SUI, normalizeSuiAddress, toHex } from "@mysten/sui/utils"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getNextNonceFromPool } from "@/lib/pump/get-nonce"
import { getServerKeypair } from "@/lib/server-keypair"

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const { poolId, amount, walletAddress } = body

		// Get authenticated user from session
		const session = await auth()
		const twitterId = session?.user?.twitterId || null
		const twitterUsername = session?.user?.username || null

		console.log(session?.user)

		if (!poolId || !amount || !walletAddress) {
			return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
		}

		const poolSettings = await prisma.tokenProtectionSettings.findUnique({ where: { poolId } })
		if (!poolSettings || !poolSettings.settings) {
			return NextResponse.json({ message: "Token not protected" }, { status: 404 })
		}

		const settings = poolSettings.settings as {
			sniperProtection?: boolean
			requireTwitter?: boolean
			revealTraderIdentity?: boolean
			minFollowerCount?: string | null
			maxHoldingPercent?: string | null
		}

		// check if sniper protection is enabled
		if (!settings.sniperProtection) {
			return NextResponse.json({ message: "Token does not have sniper protection enabled" }, { status: 404 })
		}

		// check if Twitter is required but user is not authenticated
		if (settings.requireTwitter && !session?.user) {
			return NextResponse.json(
				{
					message: "X authentication is required for this token. Please log in with X to continue.",
					requiresTwitter: true,
				},
				{ status: 401 }
			)
		}

		// check if Twitter is required but session doesn't have Twitter ID
		if (settings.requireTwitter && !twitterId) {
			return NextResponse.json(
				{
					message: "X authentication session is invalid. Please log in again.",
					requiresTwitter: true,
				},
				{ status: 403 }
			)
		}

		// Check minimum follower count requirement if set
		if (settings.minFollowerCount && Number(settings.minFollowerCount) > 0 && twitterUsername) {
			try {
				const fxTwitterResponse = await fetch(`https://api.fxtwitter.com/${twitterUsername}`)

				if (fxTwitterResponse.ok) {
					const fxTwitterData = await fxTwitterResponse.json()
					const followerCount = fxTwitterData?.user?.followers || 0
					const requiredFollowers = Number(settings.minFollowerCount)

					if (followerCount < requiredFollowers) {
						return NextResponse.json(
							{
								message: `Your X account needs at least ${requiredFollowers} followers to buy this token. You currently have ${followerCount} followers.`,
								error: "INSUFFICIENT_FOLLOWERS",
								currentFollowers: followerCount,
								requiredFollowers: requiredFollowers,
							},
							{ status: 403 }
						)
					}
				} else {
					console.error(`Failed to fetch follower count for @${twitterUsername}`)
					// Don't block the purchase if we can't verify followers
				}
			} catch (error) {
				console.error(`Error checking follower count for @${twitterUsername}:`, error)
				// Don't block the purchase if we can't verify followers
			}
		}

		// Check Twitter account-address binding when requireTwitter is enabled
		if (settings.requireTwitter && twitterId) {
			// Check if this Twitter account has already been used with a different address for this pool
			const existingRelation = await prisma.twitterAccountUserBuyRelation.findFirst({
				where: {
					twitterUserId: twitterId,
					poolId: poolId,
				},
			})

			if (existingRelation && existingRelation.address !== walletAddress) {
				return NextResponse.json(
					{
						message: `This X account is already bound to a different wallet address for this pool. You must use wallet ${existingRelation.address.slice(0, 6)}...${existingRelation.address.slice(-4)} to buy this token.`,
						error: "TWITTER_ACCOUNT_BOUND_TO_DIFFERENT_ADDRESS",
					},
					{ status: 403 }
				)
			}

			// If no existing relation, create one to bind this Twitter account to this address for this pool
			if (!existingRelation) {
				const amountInMist = BigInt(Math.floor(parseFloat(amount) * Number(MIST_PER_SUI)))
				await prisma.twitterAccountUserBuyRelation.create({
					data: {
						twitterUserId: twitterId,
						twitterUsername: twitterUsername || "",
						poolId: poolId,
						address: walletAddress,
						purchases: [
							{
								timestamp: new Date().toISOString(),
								amount: amountInMist.toString(),
							},
						],
					},
				})
			} else {
				// Update existing relation with new purchase
				const amountInMist = BigInt(Math.floor(parseFloat(amount) * Number(MIST_PER_SUI)))
				const purchases = existingRelation.purchases as Array<{ timestamp: string; amount: string }>
				purchases.push({
					timestamp: new Date().toISOString(),
					amount: amountInMist.toString(),
				})

				await prisma.twitterAccountUserBuyRelation.update({
					where: { id: existingRelation.id },
					data: { purchases },
				})
			}
		}

		try {
			const keyPair = getServerKeypair()
			const MessageStruct = bcs.struct("Message", {
				pool: bcs.Address,
				amount: bcs.U64,
				nonce: bcs.U64,
				sender: bcs.Address,
			})

			const currentNonce = await getNextNonceFromPool({
				poolId,
				address: walletAddress,
			})

			const amountInMist = BigInt(Math.floor(parseFloat(amount) * Number(MIST_PER_SUI)))
			const message = MessageStruct.serialize({
				pool: normalizeSuiAddress(poolId),
				amount: amountInMist,
				nonce: currentNonce,
				sender: normalizeSuiAddress(walletAddress),
			}).toBytes()

			const signature = await keyPair.sign(message)

			return NextResponse.json({
				signature: toHex(signature),
				publicKey: toHex(keyPair.getPublicKey().toRawBytes()),
			})
		} catch (signError) {
			console.error("Signature generation error:", signError)
			return NextResponse.json({ message: "Failed to generate signature" }, { status: 500 })
		}
	} catch (error) {
		console.error("Protected token signature error:", error)
		return NextResponse.json({ message: "Internal server error" }, { status: 500 })
	}
}
