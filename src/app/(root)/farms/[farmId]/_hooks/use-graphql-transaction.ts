import { useSignTransaction } from "@mysten/dapp-kit"
import type { Transaction } from "@mysten/sui/transactions"
import { fromBase64 } from "@mysten/sui/utils"
import { useCallback } from "react"
import { useApp } from "@/context/app.context"
import { suiGraphQLClient } from "@/lib/sui-graphql"

export const useGraphQLTransaction = () => {
	const { wallet } = useApp()
	const { mutateAsync: signTransaction } = useSignTransaction()

	const executeTransaction = useCallback(async (tx: Transaction) => {
		if (!wallet) throw new Error("No account connected")

		tx.setSenderIfNotSet(wallet.address)
		await tx.build({
			client: suiGraphQLClient,
		})
		const transaction = await tx.toJSON()
		const { signature, bytes } = await signTransaction({
			account: wallet,
			transaction,
		})

		const result = await suiGraphQLClient.core.executeTransaction({
			transaction: fromBase64(bytes),
			signatures: [signature],
			include: { effects: true },
		})

		if (result.FailedTransaction) {
			throw new Error(result.FailedTransaction.status.error?.message ?? "Transaction failed")
		}

		await suiGraphQLClient.core.waitForTransaction({
			result,
			include: { effects: true },
		})

		return result.Transaction
	}, [wallet, signTransaction])

	return { executeTransaction }
}
