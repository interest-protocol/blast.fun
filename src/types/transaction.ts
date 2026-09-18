import type { SuiClientTypes } from "@mysten/sui/client"

export type ExecutedTransaction = SuiClientTypes.Transaction<{ effects: true; events: true; objectTypes: true }>

export interface TransactionResult extends ExecutedTransaction {
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
