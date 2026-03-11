import type { SuiTransactionBlockResponse } from "@mysten/sui/jsonRpc"

export interface TimedSuiTransactionBlockResponse extends SuiTransactionBlockResponse {
    time: number
}

export interface WaitForTxOptions {
    timeout?: number
    pollInterval?: number
}

export interface ExecuteTransactionOptions {
    showObjectChanges?: boolean
    showEvents?: boolean
    showEffects?: boolean
    showRawEffects?: boolean
    waitOptions?: WaitForTxOptions
}