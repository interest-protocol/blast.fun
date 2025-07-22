import { coinWithBalance, Transaction } from "@mysten/sui/transactions"
import { MIST_PER_SUI } from "@mysten/sui/utils"
import { useState, useEffect } from "react"
import { useApp } from "@/context/app.context"
import { useTransaction } from "@/hooks/sui/use-transaction"
import { playSound } from "@/lib/audio"
import { pumpSdk } from "@/lib/pump"
import type { PoolWithMetadata } from "@/types/pool"
import { formatMistToSui } from "@/utils/format"

interface UsePumpOptions {
	pool: PoolWithMetadata
	decimals?: number
}

interface UsePumpReturn {
	isLoading: boolean
	error: string | null
	success: string | null
	pump: (amountInSui: string, slippagePercent?: number) => Promise<void>
	dump: (amountInTokens: string, slippagePercent?: number) => Promise<void>
}

export function usePump({ pool, decimals = 9 }: UsePumpOptions): UsePumpReturn {
	const { address, isConnected } = useApp()
	const { executeTransaction } = useTransaction()

	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)

	// auto-clear success message after 5 seconds
	useEffect(() => {
		if (success) {
			const timer = setTimeout(() => {
				setSuccess(null)
			}, 5000)
			return () => clearTimeout(timer)
		}
	}, [success])

	const pump = async (amountInSui: string, slippagePercent = 15) => {
		if (!isConnected || !address) {
			setError("WALLET::NOT_CONNECTED")
			return
		}

		const amount = parseFloat(amountInSui)
		if (!amount || amount <= 0) {
			setError("AMOUNT::INVALID")
			return
		}

		// check if the pool is at max bonding, ready to migrate.
		if (pool.canMigrate || parseInt(pool.bondingCurve) >= 100) {
			setError('TOKEN::MIGRATING')
			return
		}

		setIsLoading(true)
		setError(null)
		setSuccess(null)

		try {
			const amountInMist = BigInt(Math.floor(amount * Number(MIST_PER_SUI)))

			// get quote to calculate expected output
			const quote = await pumpSdk.quotePump({
				pool: pool.poolId,
				amount: amountInMist,
			})

			// calculate minimum amount out with slippage
			const slippageMultiplier = 1 - slippagePercent / 100
			const minAmountOut = BigInt(Math.floor(Number(quote.memeAmountOut) * slippageMultiplier))

			const tx = new Transaction()
			const quoteCoin = tx.splitCoins(tx.gas, [tx.pure.u64(amountInMist)])

			const { memeCoin, tx: pumpTx } = await pumpSdk.pump({
				tx,
				pool: pool.poolId,
				quoteCoin,
				minAmountOut,
			} as any)

			pumpTx.transferObjects([memeCoin], address)

			await executeTransaction(pumpTx)

			// play buy sound
			playSound("buy")

			// show success message
			const tokenAmount = Number(quote.memeAmountOut) / Math.pow(10, decimals)
			setSuccess(
				`ORDER::FILLED - Bought ${tokenAmount.toFixed(2)} ${pool.coinMetadata?.symbol || "TOKEN"} for ${amount} SUI`
			)
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "UNKNOWN_ERROR"
			setError(errorMessage)
			throw err
		} finally {
			setIsLoading(false)
		}
	}

	const dump = async (amountInTokens: string, slippagePercent = 15) => {
		if (!isConnected || !address) {
			setError("WALLET::NOT_CONNECTED")
			return
		}

		const amount = parseFloat(amountInTokens)
		if (!amount || amount <= 0) {
			setError("AMOUNT::INVALID")
			return
		}

		setIsLoading(true)
		setError(null)
		setSuccess(null)

		try {
			const amountInSmallestUnit = BigInt(Math.floor(amount * Math.pow(10, decimals)))

			// get quote to calculate expected output
			const quote = await pumpSdk.quoteDump({
				pool: pool.poolId,
				amount: amountInSmallestUnit,
			})

			// calculate minimum amount out with slippage
			const slippageMultiplier = 1 - slippagePercent / 100
			const minAmountOut = BigInt(Math.floor(Number(quote.quoteAmountOut) * slippageMultiplier))

			const tx = new Transaction()
			tx.setSender(address)

			const memeCoin = coinWithBalance({
				balance: amountInSmallestUnit,
				type: pool.coinType,
			})(tx)

			const { quoteCoin, tx: dumpTx } = await pumpSdk.dump({
				tx,
				pool: pool.poolId,
				memeCoin,
				minAmountOut,
			} as any)

			dumpTx.transferObjects([quoteCoin], address)

			await executeTransaction(dumpTx)

			// play sell sound
			playSound("sell")

			// show success message
			setSuccess(
				`ORDER::FILLED - Sold ${amount} ${pool.coinMetadata?.symbol || "TOKEN"} for ${formatMistToSui(quote.quoteAmountOut)} SUI`
			)
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "UNKNOWN_ERROR"
			setError(errorMessage)
			throw err
		} finally {
			setIsLoading(false)
		}
	}

	return {
		isLoading,
		error,
		success,
		pump,
		dump,
	}
}
