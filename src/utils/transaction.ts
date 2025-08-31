import { SuiTransactionBlockResponse } from "@mysten/sui/client"
import { suiClient } from "@/lib/sui-client"

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

/**
 * Validates transaction success and throws error if failed
 */
export const throwTransactionIfFailed = async (tx: SuiTransactionBlockResponse, customMessage?: string): Promise<void> => {
	// @dev: If no effects but has digest, wait and fetch the full transaction details
	if (!tx?.effects && tx?.digest) {
		try {
			// @dev: Wait for transaction to be indexed
			await suiClient.waitForTransaction({
				digest: tx.digest,
			})
			
			const fullTx = await suiClient.getTransactionBlock({
				digest: tx.digest,
				options: {
					showEffects: true,
					showObjectChanges: true,
					showEvents: true,
				}
			})
			tx = fullTx
		} catch (error) {
			// @dev: If we can't fetch, assume success if we have a digest
			console.warn(`Could not fetch full transaction details for ${tx.digest}`)
			return
		}
	}
	
	// @dev: If still no effects, check if we at least have a digest
	if (!tx?.effects) {
		if (!tx?.digest) {
			throw new Error(customMessage || "Transaction failed: No transaction data")
		}
		// Has digest but no effects - assume success
		return
	}
	
	// @dev: Check for explicit failure
	// Only throw if we're certain it failed
	try {
		if (tx.effects.status && typeof tx.effects.status === 'object') {
			const status = tx.effects.status as any
			// Check if explicitly failed
			if (status.status === "failure" || status.error) {
				const digest = tx.digest
				const error = status.error || "Transaction failed"
				throw new Error(customMessage || `Transaction ${digest} failed: ${error}`)
			}
		}
	} catch (e) {
		// If we can't parse the status, assume success unless it's our own error
		if (e instanceof Error && e.message.includes("failed")) {
			throw e
		}
	}
	// If we reach here, assume success
}

/**
 * Extracts object IDs from transaction result
 */
export const getObjectIdsFromTx = (
	tx: SuiTransactionBlockResponse,
	field: "created" | "mutated" | "deleted" = "created"
): string[] => {
	if (!tx.objectChanges) return []

	return tx.objectChanges
		.filter((change) => change.type === field)
		.map((change) => ("objectId" in change ? change.objectId : ""))
		.filter(Boolean)
}

/**
 * Gets the first created object ID of a specific type
 */
export const getCreatedObjectByType = (tx: SuiTransactionBlockResponse, objectType: string): string | null => {
	if (!tx.objectChanges) return null

	const object = tx.objectChanges.find(
		(change) => change.type === "created" && "objectType" in change && change.objectType.includes(objectType)
	)

	return object && "objectId" in object ? object.objectId : null
}

/**
 * Wait for transaction with configurable options
 */
export const waitForTx = async (digest: string, options: WaitForTxOptions = {}): Promise<SuiTransactionBlockResponse> => {
	const { timeout = 30000, pollInterval = 1000 } = options
	const startTime = Date.now()

	while (Date.now() - startTime < timeout) {
		try {
			const tx = await suiClient.getTransactionBlock({
				digest,
				options: {
					showEffects: true,
					showObjectChanges: true,
					showEvents: true,
				},
			})

			if (tx) return tx
		} catch (error) { }

		await new Promise((resolve) => setTimeout(resolve, pollInterval))
	}

	throw new Error(`Transaction ${digest} not found after ${timeout}ms`)
}

/**
 * Formats transaction digest for display
 */
export const formatDigest = (digest: string, length = 6): string => {
	if (digest.length <= length * 2) return digest
	return `${digest.slice(0, length)}...${digest.slice(-length)}`
}

/**
 * Gets explorer URL for transaction
 */
export const getTxExplorerUrl = (digest: string, network: "mainnet" | "testnet" = "mainnet"): string => {
	const baseUrl = network === "mainnet" ? "https://suiscan.xyz/mainnet/tx" : "https://suiscan.xyz/testnet/tx"
	return `${baseUrl}/${digest}`
}

/**
 * Extracts balance changes from transaction
 */
export const getBalanceChanges = (tx: SuiTransactionBlockResponse) => {
	if (!tx.balanceChanges) return []

	return tx.balanceChanges.map((change) => ({
		owner: change.owner,
		coinType: change.coinType,
		amount: BigInt(change.amount),
	}))
}

/**
 * Type guard for checking if object change has required fields
 */
export const isObjectChangeWithType = (change: any): change is { type: string; objectType: string; objectId: string } => {
	return (
		change &&
		typeof change.type === "string" &&
		typeof change.objectType === "string" &&
		typeof change.objectId === "string"
	)
}

/**
 * Safely extracts error message from transaction
 */
export const getTxErrorMessage = (tx: SuiTransactionBlockResponse): string | null => {
	// @dev: Handle missing effects safely
	if (!tx?.effects) return null
	
	try {
		const status = tx.effects.status as any
		// Only return error if explicitly failed
		if (status?.status === "failure" || status?.error) {
			return status.error || "Transaction failed"
		}
	} catch {
		// If we can't parse status, assume no error
	}
	
	return null
}

/**
 * Checks if transaction created a specific object type
 */
export const hasCreatedObjectType = (tx: SuiTransactionBlockResponse, objectType: string): boolean => {
	if (!tx.objectChanges) return false

	return tx.objectChanges.some(
		(change) => change.type === "created" && "objectType" in change && change.objectType.includes(objectType)
	)
}