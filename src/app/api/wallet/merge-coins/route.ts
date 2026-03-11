import { NextRequest, NextResponse } from "next/server"
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519"
import { toHex, fromHex } from "@mysten/sui/utils"
import { suiSponsorship, GasStationError } from "@3mate/gas-station-sdk"
import { walletSdk } from "@/lib/memez/sdk"
import { suiClient } from "@/lib/sui-client"
import { env } from "@/env"

const SHINAMI_GAS_API_URL = "https://api.us1.shinami.com/sui/gas/v1"

async function shinamiSponsorTransaction(accessKey: string, txKindBase64: string, sender: string) {
	const res = await fetch(SHINAMI_GAS_API_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-Api-Key": accessKey,
		},
		body: JSON.stringify({
			jsonrpc: "2.0",
			method: "gas_sponsorTransactionBlock",
			params: [txKindBase64, sender],
			id: 1,
		}),
	})
	const data = await res.json()
	if (data.error) {
		throw new Error(data.error.message ?? "Shinami gas sponsorship failed")
	}
	const { txBytes, signature } = data.result
	if (!txBytes || !signature) {
		throw new Error("Invalid Shinami sponsorship response")
	}
	return { txBytes, signature }
}

export async function POST(req: NextRequest) {
	try {
		const { coins, coinType, walletAddress } = await req.json()

		if (!coins || !Array.isArray(coins) || coins.length === 0) {
			return NextResponse.json(
				{ error: "Coins array is required" },
				{ status: 400 }
			)
		}

		if (!coinType || !walletAddress) {
			return NextResponse.json(
				{ error: "coinType and walletAddress are required" },
				{ status: 400 }
			)
		}

		const shinamiGasKey = env.SHINAMI_GAS_ACCESS_KEY ?? ""
		const gasStationApiKey = env.GAS_STATION_API_KEY ?? ""
		const useShinami = shinamiGasKey.length > 0
		const use3mate = gasStationApiKey.length > 0

		if (!useShinami && !use3mate) {
			return NextResponse.json(
				{ error: "Gas station not configured (set SHINAMI_GAS_ACCESS_KEY or GAS_STATION_API_KEY)" },
				{ status: 500 }
			)
		}

		const tempKeypair = new Ed25519Keypair()
		const tempAddress = tempKeypair.toSuiAddress()

		const { tx } = walletSdk.mergeCoins({
			coinType: coinType,
			coins: coins,
			wallet: walletAddress,
		})

		tx.setSender(tempAddress)

		const txBytes = await tx.build({ client: suiClient, onlyTransactionKind: true })

		let sponsoredTxBytes: Uint8Array
		let sponsorSignature: string

		if (useShinami) {
			const txKindBase64 = Buffer.from(txBytes).toString("base64")
			const sponsored = await shinamiSponsorTransaction(shinamiGasKey, txKindBase64, tempAddress)
			sponsoredTxBytes = new Uint8Array(Buffer.from(sponsored.txBytes, "base64"))
			sponsorSignature = sponsored.signature
		} else {
			const txBytesHex = toHex(txBytes)
			let sponsorData
			try {
				sponsorData = await suiSponsorship({
					apiKey: gasStationApiKey,
					rawTxBytesHex: txBytesHex,
					sender: tempAddress,
					network: "mainnet",
				})
			} catch (error) {
				if (error instanceof GasStationError) {
					return NextResponse.json(
						{ error: `Gas station sponsorship failed: ${error.message}` },
						{ status: 500 }
					)
				}
				throw error
			}
			sponsoredTxBytes = fromHex(sponsorData.txBytesHex)
			sponsorSignature = sponsorData.sponsorSignature
		}

		const signature = await tempKeypair.signTransaction(sponsoredTxBytes)
		const result = await suiClient.executeTransactionBlock({
			transactionBlock: sponsoredTxBytes,
			signature: [signature.signature, sponsorSignature],
			options: {
				showEffects: true,
				showObjectChanges: true,
			},
		})

		if (result.effects?.status?.status !== "success") {
			return NextResponse.json(
				{
					error: "Transaction execution failed",
					status: result.effects?.status?.status,
					errorMessage: result.effects?.status?.error,
				},
				{ status: 500 }
			)
		}

		return NextResponse.json({
			success: true,
			transactionDigest: result.digest,
			mergedCount: coins.length,
			gasInfo: {
				computationCost: result.effects?.gasUsed?.computationCost || "0",
				storageCost: result.effects?.gasUsed?.storageCost || "0",
				storageRebate: result.effects?.gasUsed?.storageRebate || "0",
			},
		})
	} catch (error) {
		console.error("Error in merge-coins API:", error)
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Failed to merge coins",
			},
			{ status: 500 }
		)
	}
}
