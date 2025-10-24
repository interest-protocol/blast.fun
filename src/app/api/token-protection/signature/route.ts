import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { MIST_PER_SUI, normalizeSuiAddress, toHex } from "@mysten/sui/utils"
import { bcs } from "@mysten/sui/bcs"
import { getServerKeypair } from "@/lib/server-keypair"
import { getNextNonceFromPool } from "@/lib/pump/get-nonce"
import { auth } from "@/auth"
import { pumpSdk } from "@/lib/pump"
import { fetchCoinBalance } from "@/lib/fetch-portfolio"
import { TOTAL_POOL_SUPPLY } from "@/constants"

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const { poolId, amount, walletAddress, coinType, decimals } = body
		
		// Get authenticated user from session
		const session = await auth()
		const twitterId = session?.user?.twitterId || null
		const twitterUsername = session?.user?.username || null

		console.log(session?.user);

		if (!poolId || !amount || !walletAddress || !coinType) {
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
			return NextResponse.json({
				message: "X authentication is required for this token. Please log in with X to continue.",
				requiresTwitter: true
			}, { status: 401 })
		}
		
		// check if Twitter is required but session doesn't have Twitter ID
		if (settings.requireTwitter && !twitterId) {
			return NextResponse.json({
				message: "X authentication session is invalid. Please log in again.",
				requiresTwitter: true
			}, { status: 403 })
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
						return NextResponse.json({
							message: `Your X account needs at least ${requiredFollowers} followers to buy this token. You currently have ${followerCount} followers.`,
							error: "INSUFFICIENT_FOLLOWERS",
							currentFollowers: followerCount,
							requiredFollowers: requiredFollowers
						}, { status: 406 })
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
					poolId: poolId
				}
			})

			if (existingRelation && existingRelation.address !== walletAddress) {
				return NextResponse.json({
					message: `This X account is already bound to a different wallet address for this pool. You must use wallet ${existingRelation.address.slice(0, 6)}...${existingRelation.address.slice(-4)} to buy this token.`,
					error: "TWITTER_ACCOUNT_BOUND_TO_DIFFERENT_ADDRESS"
				}, { status: 409 })
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
						purchases: [{
							timestamp: new Date().toISOString(),
							amount: amountInMist.toString()
						}]
					}
				})
			} else {
				// Update existing relation with new purchase
				const amountInMist = BigInt(Math.floor(parseFloat(amount) * Number(MIST_PER_SUI)))
				const purchases = existingRelation.purchases as Array<{ timestamp: string; amount: string }>
				purchases.push({
					timestamp: new Date().toISOString(),
					amount: amountInMist.toString()
				})
				
				await prisma.twitterAccountUserBuyRelation.update({
					where: { id: existingRelation.id },
					data: { purchases }
				})
			}
		}

		// Check max holding percentage if set
		if (settings.maxHoldingPercent && Number(settings.maxHoldingPercent) > 0) {
			try {
				// Get user's current balance for this token
				const currentBalance = await fetchCoinBalance(walletAddress, coinType)
				const currentBalanceBigInt = BigInt(currentBalance)

				// Convert SUI amount to MIST for quote
				const amountInMist = BigInt(Math.floor(parseFloat(amount) * Number(MIST_PER_SUI)))

				// Get quote to see how many tokens they would receive
				const quote = await pumpSdk.quotePump({
					pool: poolId,
					amount: amountInMist,
				})

				// Calculate percentages using the provided decimals with fallback
				const tokenDecimals = decimals || 9
				const totalSupplyHuman = Number(TOTAL_POOL_SUPPLY) / Math.pow(10, tokenDecimals)
				const currentBalanceHuman = Number(currentBalanceBigInt) / Math.pow(10, tokenDecimals)
				const quoteAmountOutHuman = Number(quote.memeAmountOut) / Math.pow(10, tokenDecimals)
				const totalBalanceAfterHuman = currentBalanceHuman + quoteAmountOutHuman

				const percentageAfter = (totalBalanceAfterHuman / totalSupplyHuman) * 100
				const maxAllowedPercent = Number(settings.maxHoldingPercent) + 0.01

				if (percentageAfter >= maxAllowedPercent) {
					return NextResponse.json({
						message: `This purchase would give you ${percentageAfter.toFixed(2)}% of total supply, exceeding the ${settings.maxHoldingPercent}% limit`,
						error: "MAX_HOLDING_EXCEEDED",
						currentPercentage: ((currentBalanceHuman / totalSupplyHuman) * 100).toFixed(2),
						maxAllowed: settings.maxHoldingPercent,
						wouldBe: percentageAfter.toFixed(2)
					}, { status: 416 })
				}
			} catch (error) {
				console.error("Failed to check max holding percentage:", error)
				// Don't block the purchase if we can't verify the holding percentage
				// This ensures the user experience isn't broken by temporary API issues
			}
		}

		try {
			const keyPair = getServerKeypair()
			const MessageStruct = bcs.struct('Message', {
				pool: bcs.Address,
				amount: bcs.U64,
				nonce: bcs.U64,
				sender: bcs.Address,
			})

			const currentNonce = await getNextNonceFromPool({
				poolId,
				address: walletAddress
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
			return NextResponse.json(
				{ message: "Failed to generate signature" },
				{ status: 500 }
			)
		}
	} catch (error) {
		console.error("Protected token signature error:", error)
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 }
		)
	}
}