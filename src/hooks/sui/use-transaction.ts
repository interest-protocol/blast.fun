import { useSignTransaction } from "@mysten/dapp-kit"
import type { Transaction } from "@mysten/sui/transactions"
import { fromBase64 } from "@mysten/sui/utils"
import { useCallback } from "react"
import { useApp } from "@/context/app.context"
import { suiGrpcClient } from "@/lib/sui-grpc"
import type { ExecuteTransactionOptions, TransactionResult } from "@/types/transaction"
import { throwTransactionIfFailed } from "@/utils/transaction"

// @dev: Public fullnodes no longer serve JSON-RPC; transactions are submitted and awaited over gRPC.
const INCLUDE = { effects: true, events: true, objectTypes: true } as const

export const useTransaction = () => {
	const { wallet } = useApp()
	const { mutateAsync: signTransaction } = useSignTransaction()

	const executeTransaction = useCallback(
		async (tx: Transaction, options: ExecuteTransactionOptions = {}): Promise<TransactionResult> => {
			if (!wallet) {
				throw new Error("No account connected")
			}

			try {
				const { signature, bytes } = await signTransaction({
					account: wallet,
					transaction: tx,
				})

				const startTime = Date.now()
				const executed = await suiGrpcClient.executeTransaction({
					transaction: fromBase64(bytes),
					signatures: [signature],
					include: INCLUDE,
				})

				const submitted = executed.Transaction ?? executed.FailedTransaction
				throwTransactionIfFailed(submitted)

				// @dev: Wait until the fullnode has checkpointed the transaction so follow-up reads observe it.
				const confirmed = await suiGrpcClient.waitForTransaction({
					result: executed,
					include: INCLUDE,
					timeout: options.waitOptions?.timeout,
				})
				const finalResult = confirmed.Transaction ?? confirmed.FailedTransaction
				throwTransactionIfFailed(finalResult)

				return {
					...finalResult,
					time: Date.now() - startTime,
				}
			} catch (error) {
				console.error("Transaction execution failed:", error)
				throw error instanceof Error ? error : new Error("Transaction failed")
			}
		},
		[wallet, signTransaction]
	)

	const executeTransactionWithRetry = useCallback(
		async (
			tx: Transaction,
			options: ExecuteTransactionOptions & { maxRetries?: number } = {}
		): Promise<TransactionResult> => {
			const { maxRetries = 1, ...txOptions } = options
			let lastError: Error | null = null

			for (let attempt = 0; attempt <= maxRetries; attempt++) {
				try {
					return await executeTransaction(tx, txOptions)
				} catch (error) {
					lastError = error instanceof Error ? error : new Error("Unknown error")

					if (attempt < maxRetries) {
						console.log(`Transaction attempt ${attempt + 1} failed, retrying...`)
						await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)))
					}
				}
			}

			throw lastError || new Error("Transaction failed after retries")
		},
		[executeTransaction]
	)

	return {
		executeTransaction,
		executeTransactionWithRetry,
	}
}
