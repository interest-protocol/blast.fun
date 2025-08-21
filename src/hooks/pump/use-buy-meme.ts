import { Transaction } from "@mysten/sui/transactions"
import { MIST_PER_SUI } from "@mysten/sui/utils"
import { useApp } from "@/context/app.context"
import { useTransaction } from "@/hooks/sui/use-transaction"
import { playSound } from "@/lib/audio"
import { pumpSdk } from "@/lib/pump"

export function useBuyMeme(poolId: string) {
	const { address, isConnected } = useApp()
	const { executeTransaction } = useTransaction()

	const handleBuy = async (amountInMist: string, slippagePercent = 15) => {
		if (!isConnected || !address) {
			throw new Error("Wallet not connected")
		}

		const amountInMistBigInt = BigInt(amountInMist)

		const quote = await pumpSdk.quotePump({
			pool: poolId,
			amount: amountInMistBigInt,
		})

		const slippageMultiplier = 1 - slippagePercent / 100
		const minAmountOut = BigInt(Math.floor(Number(quote.memeAmountOut) * slippageMultiplier))

		const tx = new Transaction()
		const quoteCoin = tx.splitCoins(tx.gas, [tx.pure.u64(amountInMistBigInt)])
		pumpSdk.burnMeme

		const { memeCoin, tx: pumpTx } = await pumpSdk.pump({
			tx,
			pool: poolId,
			quoteCoin,
			minAmountOut,
		})

		pumpTx.transferObjects([memeCoin], address)

		await executeTransaction(pumpTx)

		playSound("buy")
	}

	return { handleBuy }
}