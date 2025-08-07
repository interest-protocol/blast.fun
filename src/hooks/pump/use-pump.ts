import { coinWithBalance, Transaction } from "@mysten/sui/transactions"
import { MIST_PER_SUI, fromHex } from "@mysten/sui/utils"
import { useState, useEffect } from "react"
import { useApp } from "@/context/app.context"
import { useTransaction } from "@/hooks/sui/use-transaction"
import { playSound } from "@/lib/audio"
import { pumpSdk } from "@/lib/pump"
import type { PoolWithMetadata } from "@/types/pool"
import { formatMistToSui } from "@/utils/format"
import { useTwitter } from "@/context/twitter.context"
import { TOTAL_POOL_SUPPLY } from "@/constants"
import { fetchCoinBalance } from "@/lib/fetch-portfolio"

interface UsePumpOptions {
	pool: PoolWithMetadata
	decimals?: number
	actualBalance?: string
	referrerWallet?: string | null
}

interface UsePumpReturn {
	isProcessing: boolean
	error: string | null
	success: string | null
	pump: (amountInSui: string, slippagePercent?: number) => Promise<void>
	dump: (amountInTokens: string, slippagePercent?: number) => Promise<void>
}

export function usePump({ pool, decimals = 9, actualBalance, referrerWallet }: UsePumpOptions): UsePumpReturn {
	const { address, isConnected } = useApp()
	const { executeTransaction } = useTransaction()
	const { user: twitterUser } = useTwitter()

	const [isProcessing, setIsProcessing] = useState(false)
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

	const getProtectedPoolSignature = async (amount: string) => {
		if (!pool.isProtected) return null

		try {
			const response = await fetch("/api/token-protection/signature", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					poolId: pool.poolId,
					amount,
					walletAddress: address,
					twitterId: twitterUser?.id || null,
				}),
			})

			if (!response.ok) {
				const error = await response.json()

				if (error.requiresTwitter) {
					throw new Error("You must be authenticated with X to interact with this token.")
				}

				throw new Error(error.message || "SIGNATURE::FAILED")
			}

			const data = await response.json()
			return data
		} catch (error) {
			if (error instanceof Error) {
				throw error
			}
			throw new Error("SIGNATURE::VALIDATION_FAILED")
		}
	}

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

		setIsProcessing(true)
		setError(null)
		setSuccess(null)

		try {
			if (pool.isProtected) {
				try {
					const response = await fetch(`/api/token-protection/settings/${pool.poolId}`)
					if (response.ok) {
						const { settings } = await response.json()

						if (settings?.maxHoldingPercent) {
							const currentBalance = await fetchCoinBalance(address, pool.coinType)
							const currentBalanceBigInt = BigInt(currentBalance)

							const amountInMist = BigInt(Math.floor(amount * Number(MIST_PER_SUI)))
							const quote = await pumpSdk.quotePump({
								pool: pool.poolId,
								amount: amountInMist,
							})

							const totalSupplyHuman = Number(TOTAL_POOL_SUPPLY) / Math.pow(10, decimals)
							const currentBalanceHuman = Number(currentBalanceBigInt) / Math.pow(10, decimals)
							const quoteAmountOutHuman = Number(quote.memeAmountOut) / Math.pow(10, decimals)
							const totalBalanceAfterHuman = currentBalanceHuman + quoteAmountOutHuman

							const percentageAfter = (totalBalanceAfterHuman / totalSupplyHuman) * 100

							// check if it exceeds the max holding percentage
							if (percentageAfter > settings.maxHoldingPercent) {
								setError(`MAX::HOLDING_EXCEEDED - This purchase would give you ${percentageAfter.toFixed(2)}% of total supply, exceeding the ${settings.maxHoldingPercent}% limit`)
								return
							}
						}
					}
				} catch (error) {
					console.error("Failed to check max holding:", error)
					// continue anyways 
				}
			}

			const amountInMist = BigInt(Math.floor(amount * Number(MIST_PER_SUI)))
			const quote = await pumpSdk.quotePump({
				pool: pool.poolId,
				amount: amountInMist,
			})

			// calculate minimum amount out with slippage
			const slippageMultiplier = 1 - slippagePercent / 100
			const minAmountOut = BigInt(Math.floor(Number(quote.memeAmountOut) * slippageMultiplier))

			const tx = new Transaction()
			const quoteCoin = tx.splitCoins(tx.gas, [tx.pure.u64(amountInMist)])

			const signatureData = await getProtectedPoolSignature(amountInSui)
			const { memeCoin, tx: pumpTx } = await pumpSdk.pump({
				tx,
				pool: pool.poolId,
				quoteCoin,
				minAmountOut,
				referrer: referrerWallet ?? undefined,
				signature: signatureData ? fromHex(signatureData.signature) : undefined
			})

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
			setIsProcessing(false)
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

		const amountInSmallestUnit = BigInt(Math.floor(amount * Math.pow(10, decimals)))
		if (actualBalance) {
			const actualBalanceBigInt = BigInt(actualBalance)
			if (amountInSmallestUnit > actualBalanceBigInt) {
				setError(`You don't have enough for this. You only have ${(Number(actualBalance) / Math.pow(10, decimals)).toFixed(4)} ${pool.coinMetadata?.symbol || "TOKEN"}`)
				return
			}
		}

		setIsProcessing(true)
		setError(null)
		setSuccess(null)

		try {

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

			let balanceToUse: bigint
			if (actualBalance) {
				const actualBalanceBigInt = BigInt(actualBalance)

				// If 99% or more of balance, use full balance to avoid dust
				const threshold = (actualBalanceBigInt * 99n) / 100n
				if (amountInSmallestUnit >= threshold) {
					balanceToUse = actualBalanceBigInt
				} else {
					balanceToUse = amountInSmallestUnit
				}
			} else {
				balanceToUse = amountInSmallestUnit
			}

			const memeCoin = coinWithBalance({
				balance: balanceToUse,
				type: pool.coinType,
			})(tx)

			const { quoteCoin, tx: dumpTx } = await pumpSdk.dump({
				tx,
				pool: pool.poolId,
				memeCoin,
				minAmountOut,
				referrer: referrerWallet ?? undefined
			})

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
			setIsProcessing(false)
		}
	}

	return {
		isProcessing,
		error,
		success,
		pump,
		dump,
	}
}
