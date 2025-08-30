"use client"

import { useCallback } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { Transaction } from "@mysten/sui/transactions"
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519"
import { toBase64 } from "@mysten/sui/utils"
import { messageWithIntent, toSerializedSignature } from "@mysten/sui/cryptography"
import { blake2b } from "@noble/hashes/blake2"
import { useSuiClient } from "@mysten/dapp-kit"
import toast from "react-hot-toast"
import { usePrivySuiWallet } from "./use-privy-sui-wallet"

export interface UsePrivySuiTransactionReturn {
	signAndExecuteTransaction: (tx: Transaction) => Promise<any>
	signTransaction: (tx: Transaction) => Promise<string>
	signPersonalMessage: (message: string) => Promise<{
		signature: string
		bytes: string
	} | undefined>
}

export function usePrivySuiTransaction(): UsePrivySuiTransactionReturn {
	const { authenticated } = usePrivy()
	const client = useSuiClient()
	const { getSuiWallet } = usePrivySuiWallet()

	const signTransaction = useCallback(async (tx: Transaction): Promise<string> => {
		if (!authenticated) {
			throw new Error("Not authenticated")
		}

		const walletData = getSuiWallet()
		if (!walletData) {
			throw new Error("No Sui wallet found")
		}

		try {
			// @dev: Build transaction bytes
			const txBytes = await tx.build({ client })
			
			// @dev: Create intent message for signing
			const intentMessage = messageWithIntent("TransactionData", txBytes)
			const digest = blake2b(intentMessage, { dkLen: 32 })
			
			// @dev: Recreate keypair from stored private key (already base64)
			const keypair = Ed25519Keypair.fromSecretKey(walletData.privateKey)
			
			// @dev: Sign the digest
			const signature = await keypair.sign(digest)
			
			// @dev: Create serialized signature
			const txSignature = toSerializedSignature({
				signature: signature,
				signatureScheme: "ED25519",
				publicKey: keypair.getPublicKey(),
			})
			
			return txSignature
		} catch (error) {
			console.error("Failed to sign transaction:", error)
			throw error
		}
	}, [authenticated, client, getSuiWallet])

	const signAndExecuteTransaction = useCallback(async (tx: Transaction): Promise<any> => {
		if (!authenticated) {
			toast.error("Please login first")
			return
		}

		const walletData = getSuiWallet()
		if (!walletData) {
			toast.error("No Sui wallet found. Please create one first.")
			return
		}

		try {
			// @dev: Sign the transaction
			const signature = await signTransaction(tx)
			
			// @dev: Build transaction bytes for execution
			const txBytes = await tx.build({ client })
			
			// @dev: Execute the transaction
			const result = await client.executeTransactionBlock({
				transactionBlock: toBase64(txBytes),
				signature,
				options: {
					showEffects: true,
					showEvents: true,
					showObjectChanges: true,
				},
			})
			
			toast.success("Transaction executed successfully!")
			return result
		} catch (error) {
			console.error("Failed to execute transaction:", error)
			toast.error("Failed to execute transaction")
			throw error
		}
	}, [authenticated, client, getSuiWallet, signTransaction])

	const signPersonalMessage = useCallback(async (message: string): Promise<{
		signature: string
		bytes: string
	} | undefined> => {
		if (!authenticated) {
			toast.error("Please login first")
			return undefined
		}

		const walletData = getSuiWallet()
		if (!walletData) {
			toast.error("No Sui wallet found")
			return undefined
		}

		try {
			// @dev: Recreate keypair from stored private key (already base64)
			const keypair = Ed25519Keypair.fromSecretKey(walletData.privateKey)
			
			// @dev: Sign the message
			const messageBytes = new TextEncoder().encode(message)
			const signature = await keypair.signPersonalMessage(messageBytes)
			
			return {
				signature: signature.signature,
				bytes: signature.bytes,
			}
		} catch (error) {
			console.error("Failed to sign message:", error)
			toast.error("Failed to sign message")
			return undefined
		}
	}, [authenticated, getSuiWallet])

	return {
		signAndExecuteTransaction,
		signTransaction,
		signPersonalMessage,
	}
}