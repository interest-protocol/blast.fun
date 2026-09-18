import type { ExecutedTransaction } from "@/types/transaction"

export const throwTransactionIfFailed = (tx: ExecutedTransaction, customMessage?: string): void => {
	if (tx.status.success) return

	const error = tx.status.error?.message ?? "Unknown error"
	throw new Error(customMessage || `Transaction ${tx.digest} failed: ${error}`)
}

export const getCreatedObjectByType = (tx: ExecutedTransaction, objectType: string): string | null => {
	const created = tx.effects.changedObjects.find(
		(change) => change.idOperation === "Created" && tx.objectTypes[change.objectId]?.includes(objectType)
	)

	return created?.objectId ?? null
}

export const getTxExplorerUrl = (digest: string, network: "mainnet" | "testnet" = "mainnet"): string => {
	const baseUrl = network === "mainnet" ? "https://suiscan.xyz/mainnet/tx" : "https://suiscan.xyz/testnet/tx"
	return `${baseUrl}/${digest}`
}
