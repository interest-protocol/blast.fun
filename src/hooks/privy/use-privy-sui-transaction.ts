"use client"

import { useCallback } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { Transaction } from "@mysten/sui/transactions"
import toast from "react-hot-toast"
import {
	verifyAndSignPrivyTransaction,
	verifyAndExecutePrivyTransaction,
	verifyAndSignPersonalMessageWithPrivy,
} from "@/utils/privy"

export interface UsePrivySuiTransactionReturn {
	signAndExecuteTransaction: (tx: Transaction) => Promise<any>
	signTransaction: (tx: Transaction) => Promise<string | null>
	signPersonalMessage: (message: string) => Promise<{
		signature: string
		bytes: string
	} | undefined>
}

export function usePrivySuiTransaction(): UsePrivySuiTransactionReturn {
	const { authenticated, getAccessToken } = usePrivy()

	const signTransaction = useCallback(async (tx: Transaction): Promise<string | null> => {
		if (!authenticated) {
			toast.error("Please login first")
			return null
		}

		try {
			const accessToken = await getAccessToken()
			const result = await verifyAndSignPrivyTransaction(tx, accessToken)
			return result?.signature || null
		} catch (error) {
			console.error("Failed to sign transaction:", error)
			toast.error("Failed to sign transaction")
			return null
		}
	}, [authenticated, getAccessToken])

	const signAndExecuteTransaction = useCallback(async (tx: Transaction): Promise<any> => {
		if (!authenticated) {
			toast.error("Please login first")
			return null
		}

		try {
			const accessToken = await getAccessToken()
			const result = await verifyAndExecutePrivyTransaction(tx, accessToken)
			if (result) {
				toast.success("Transaction executed successfully!")
			}
			return result
		} catch (error) {
			console.error("Failed to execute transaction:", error)
			toast.error("Failed to execute transaction")
			return null
		}
	}, [authenticated, getAccessToken])

	const signPersonalMessage = useCallback(async (message: string): Promise<{
		signature: string
		bytes: string
	} | undefined> => {
		if (!authenticated) {
			toast.error("Please login first")
			return undefined
		}

		try {
			const accessToken = await getAccessToken()
			const result = await verifyAndSignPersonalMessageWithPrivy(message, accessToken)
			if (result && result.signature) {
				return result
			}
			return undefined
		} catch (error) {
			console.error("Failed to sign message:", error)
			toast.error("Failed to sign message")
			return undefined
		}
	}, [authenticated, getAccessToken])

	return {
		signAndExecuteTransaction,
		signTransaction,
		signPersonalMessage,
	}
}