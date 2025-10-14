import { useSignTransaction } from "@mysten/dapp-kit"
import { SuiTransactionBlockResponse } from "@mysten/sui/client"
import type { Transaction } from "@mysten/sui/transactions"
import { useCallback } from "react"
import { useApp } from "@/context/app.context"
import { suiClient } from "@/lib/sui-client"
import { ExecuteTransactionOptions, TimedSuiTransactionBlockResponse } from "@/types/transaction"
import { throwTransactionIfFailed } from "@/utils/transaction"

interface TransactionResult extends TimedSuiTransactionBlockResponse {
    digest: string
    objectChanges: NonNullable<SuiTransactionBlockResponse["objectChanges"]>
}

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
                const txResult = await suiClient.executeTransactionBlock({
                    transactionBlock: bytes,
                    signature,
                    options: {
                        showEffects: true,
                        ...options,
                    },
                    requestType: "WaitForLocalExecution",
                })

                const endTime = Date.now()
                throwTransactionIfFailed(txResult)

                let finalResult: TimedSuiTransactionBlockResponse
                if (txResult.timestampMs) {
                    finalResult = {
                        ...txResult,
                        time: Number(txResult.timestampMs) - startTime,
                    }
                } else {
                    const fullTxResponse = await suiClient.getTransactionBlock({
                        digest: txResult.digest,
                        options: {
                            showEffects: true,
                            showObjectChanges: true,
                            showEvents: true,
                        },
                    })

                    finalResult = {
                        ...fullTxResponse,
                        time: Number(fullTxResponse.timestampMs ?? endTime) - startTime,
                    }
                }

                if (!finalResult.objectChanges && options.showObjectChanges !== false) {
                    throw new Error(`Transaction ${finalResult.digest} succeeded but no object changes found`)
                }

                return {
                    ...finalResult,
                    digest: finalResult.digest,
                    objectChanges: finalResult.objectChanges || [],
                } as TransactionResult
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