import { NextRequest, NextResponse } from "next/server"
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client"

const GAS_STATION_API_KEY = process.env.GAS_STATION_API_KEY || ""
const GAS_STATION_API_URL = "https://api.3mate.io/gas-station/sponsor"

export async function POST(req: NextRequest) {
	try {
		const { txBytesHex, sender } = await req.json()

		if (!txBytesHex || !sender) {
			return NextResponse.json(
				{ error: "txBytesHex and sender are required" },
				{ status: 400 }
			)
		}

		if (!GAS_STATION_API_KEY) {
			return NextResponse.json(
				{ error: "Gas station not configured" },
				{ status: 500 }
			)
		}

		// Initialize SUI client
		const suiClient = new SuiClient({ url: getFullnodeUrl("mainnet") })

		// Convert hex to bytes for dry run
		const txBytes = Uint8Array.from(Buffer.from(txBytesHex, 'hex'))

		console.log(`Dry running transaction from sender: ${sender}`)

		// Perform dry run to check gas costs
		const dryRunResult = await suiClient.dryRunTransactionBlock({
			transactionBlock: txBytes
		})

		// Check if the transaction would succeed
		if (dryRunResult.effects.status.status !== "success") {
			return NextResponse.json(
				{ 
					error: "Transaction would fail", 
					status: dryRunResult.effects.status.status,
					errorMessage: dryRunResult.effects.status.error 
				},
				{ status: 400 }
			)
		}

		// Calculate gas rebate
		const gasUsed = BigInt(dryRunResult.effects.gasUsed.computationCost) + 
						BigInt(dryRunResult.effects.gasUsed.storageCost) - 
						BigInt(dryRunResult.effects.gasUsed.storageRebate)
		
		const storageRebate = BigInt(dryRunResult.effects.gasUsed.storageRebate)
		const netGasCost = gasUsed - storageRebate

		console.log(`Gas calculation:`)
		console.log(`  Computation Cost: ${dryRunResult.effects.gasUsed.computationCost}`)
		console.log(`  Storage Cost: ${dryRunResult.effects.gasUsed.storageCost}`)
		console.log(`  Storage Rebate: ${dryRunResult.effects.gasUsed.storageRebate}`)
		console.log(`  Net Gas Cost: ${netGasCost.toString()}`)

		// Check if we're getting a positive rebate (negative net gas cost)
		if (netGasCost >= 0) {
			return NextResponse.json(
				{ 
					error: "Transaction does not yield positive gas rebate",
					gasUsed: gasUsed.toString(),
					storageRebate: storageRebate.toString(),
					netGasCost: netGasCost.toString()
				},
				{ status: 400 }
			)
		}

		console.log("Transaction yields positive rebate, requesting sponsorship...")

		// Request gas station sponsorship
		const sponsorResponse = await fetch(GAS_STATION_API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-api-key": GAS_STATION_API_KEY,
			},
			body: JSON.stringify({
				network: "mainnet",
				rawTxBytesHex: txBytesHex,
				sender: sender,
			}),
		})

		if (!sponsorResponse.ok) {
			const errorText = await sponsorResponse.text()
			return NextResponse.json(
				{ error: `Gas station sponsorship failed: ${errorText}` },
				{ status: 500 }
			)
		}

		const sponsorData = await sponsorResponse.json()

		if (!sponsorData.txBytesHex || !sponsorData.sponsorSignature) {
			return NextResponse.json(
				{ error: "Invalid sponsorship response" },
				{ status: 500 }
			)
		}

		console.log("Sponsorship successful")

		// Return sponsored transaction data along with gas calculation info
		return NextResponse.json({
			success: true,
			txBytesHex: sponsorData.txBytesHex,
			sponsorSignature: sponsorData.sponsorSignature,
			gasInfo: {
				computationCost: dryRunResult.effects.gasUsed.computationCost,
				storageCost: dryRunResult.effects.gasUsed.storageCost,
				storageRebate: dryRunResult.effects.gasUsed.storageRebate,
				netGasCost: netGasCost.toString(),
				rebateAmount: Math.abs(Number(netGasCost)).toString()
			}
		})

	} catch (error) {
		console.error("Error in sponsor-tx API:", error)
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Failed to sponsor transaction",
			},
			{ status: 500 }
		)
	}
}