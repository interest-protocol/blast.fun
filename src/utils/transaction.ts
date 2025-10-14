import { SuiTransactionBlockResponse } from "@mysten/sui/client"

export const throwTransactionIfFailed = (tx: SuiTransactionBlockResponse, customMessage?: string): void => {
    if (!tx.effects || tx.effects.status.status !== "success") {
        const digest = tx.digest
        const error = tx.effects?.status.error || "Unknown error"
        throw new Error(customMessage || `Transaction ${digest} failed: ${error}`)
    }
}