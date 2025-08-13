import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { MIST_PER_SUI, normalizeSuiAddress, toHex } from "@mysten/sui/utils"
import { bcs } from "@mysten/sui/bcs"
import { getServerKeypair } from "@/lib/server-keypair"
import { getNextNonceFromPool } from "@/lib/pump/get-nonce"

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const { poolId, amount, walletAddress, twitterId } = body

		if (!poolId || !amount || !walletAddress) {
			return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
		}

		const poolSettings = await prisma.tokenProtectionSettings.findUnique({ where: { poolId } })
		if (!poolSettings || !poolSettings.settings) {
			return NextResponse.json({ error: "Token not protected" }, { status: 404 })
		}

		const settings = poolSettings.settings as {
			sniperProtection?: boolean
			requireTwitter?: boolean
			maxHoldingPercent?: string | null
		}

		// check if sniper protection is enabled
		if (!settings.sniperProtection) {
			return NextResponse.json({ error: "Token does not have sniper protection enabled" }, { status: 404 })
		}

		// check if Twitter is required but not provided
		if (settings.requireTwitter && !twitterId) {
			return NextResponse.json({
				error: "X authentication is required for this token",
				requiresTwitter: true
			}, { status: 403 })
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
				{ error: "Failed to generate signature" },
				{ status: 500 }
			)
		}
	} catch (error) {
		console.error("Protected token signature error:", error)
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		)
	}
}