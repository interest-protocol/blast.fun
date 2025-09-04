"use client"

import { useState } from "react"
import { useApp } from "@/context/app.context"
import { useTransaction } from "@/hooks/sui/use-transaction"
import { coinWithBalance } from "@mysten/sui/transactions"
import { pumpSdk } from "@/lib/pump"
import BigNumber from "bignumber.js"
import type { Token } from "@/types/token"

interface UseBurnParams {
	pool: Token
	decimals: number
	actualBalance: string | undefined
	onSuccess?: () => void
}

export function useBurn({ pool, decimals, actualBalance, onSuccess }: UseBurnParams) {
	const [isProcessing, setIsProcessing] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const { address } = useApp()
	const { executeTransaction } = useTransaction()

	const burn = async (amount: string) => {
		if (!amount || parseFloat(amount) <= 0) {
			setError("Please enter a valid amount")
			return false
		}

		if (!address) {
			setError("Please connect your wallet")
			return false
		}

		setIsProcessing(true)
		setError(null)

		try {
			// @dev: Calculate amount in smallest unit for burn transaction
			const amountBN = new BigNumber(amount)
			const amountInSmallestUnit = amountBN.multipliedBy(Math.pow(10, decimals)).toFixed(0)
			const burnAmount = BigInt(amountInSmallestUnit)

			// @dev: Create coin object with amount to burn
			const memeCoin = coinWithBalance({
				type: pool.coinType,
				balance: burnAmount,
			})

			// @dev: Create and execute burn transaction
			const { tx } = await pumpSdk.burnMeme({
				ipxTreasury: pool.pool?.coinIpxTreasuryCap || "",
				memeCoin,
				coinType: pool.coinType,
			})

			const result = await executeTransaction(tx)
			
			if (onSuccess) {
				onSuccess()
			}

			return result.digest
		} catch (err) {
			console.error("Burn error:", err)
			const errorMessage = err instanceof Error ? err.message : "Failed to burn tokens"
			setError(errorMessage)
			return false
		} finally {
			setIsProcessing(false)
		}
	}

	return {
		burn,
		isProcessing,
		error,
		setError,
	}
}