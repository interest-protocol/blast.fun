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
export const throwTransactionIfFailed = (tx: SuiTransactionBlockResponse, customMessage?: string): void => {
	if (!tx.effects || tx.effects.status.status !== "success") {
		const digest = tx.digest
		const error = tx.effects?.status.error || "Unknown error"
		throw new Error(customMessage || `Transaction ${digest} failed: ${error}`)
	}
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
 * Parses a Sui object type to extract its components
 * Example: "0x2::coin::Coin<0x2::sui::SUI>" -> { address: "0x2", module: "coin", name: "Coin" }
 */
const parseObjectType = (objectType: string) => {
	const typeWithoutGenerics = objectType.split('<')[0]
	const parts = typeWithoutGenerics.split('::')

	if (parts.length < 3) return null

	return {
		address: parts[0],
		module: parts[parts.length - 2],
		name: parts[parts.length - 1],
		fullType: typeWithoutGenerics
	}
}

export const getCreatedObjectByType = (tx: SuiTransactionBlockResponse, objectType: string): string | null => {
	if (!tx.objectChanges) return null

	const object = tx.objectChanges.find((change) => {
		if (change.type !== "created" || !("objectType" in change)) return false

		const parsed = parseObjectType(change.objectType)
		if (!parsed) return false

		if (objectType.includes('::')) {
			// full or partial path matching
			return parsed.fullType.endsWith(objectType)
		} else {
			// type name matching
			return parsed.name === objectType
		}
	})

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
	if (!tx.effects || tx.effects.status.status === "success") return null

	return tx.effects.status.error || "Transaction failed"
}

/**
 * Checks if transaction created a specific object type
 */
export const hasCreatedObjectType = (tx: SuiTransactionBlockResponse, objectType: string): boolean => {
	if (!tx.objectChanges) return false

	return tx.objectChanges.some((change) => {
		if (change.type !== "created" || !("objectType" in change)) return false

		const parsed = parseObjectType(change.objectType)
		if (!parsed) return false

		if (objectType.includes('::')) {
			return parsed.fullType.endsWith(objectType)
		} else {
			return parsed.name === objectType
		}
	})
}
