import { coinWithBalance, Transaction } from "@mysten/sui/transactions"
import { MIST_PER_SUI, fromHex } from "@mysten/sui/utils"
import { useState, useEffect } from "react"
import { useApp } from "@/context/app.context"
import { useTransaction } from "@/hooks/sui/use-transaction"
import { playSound } from "@/lib/audio"
import { pumpSdk } from "@/lib/pump"
import { buyMigratedToken, sellMigratedToken, getBuyQuote, getSellQuote } from "@/lib/aftermath"
import type { PoolWithMetadata } from "@/types/pool"
import { formatMistToSui } from "@/utils/format"
import { useTwitter } from "@/context/twitter.context"
import { TOTAL_POOL_SUPPLY } from "@/constants"
import { fetchCoinBalance } from "@/lib/fetch-portfolio"

interface UseTradingOptions {
	pool: PoolWithMetadata
	decimals?: number
	actualBalance?: string
	referrerWallet?: string | null
}

interface UseTradingReturn {
	isProcessing: boolean
	error: string | null
	success: string | null
	buy: (amountInSui: string, slippagePercent?: number) => Promise<void>
	sell: (amountInTokens: string, slippagePercent?: number) => Promise<void>
}

export function useTrading({ pool, decimals = 9, actualBalance, referrerWallet }: UseTradingOptions): UseTradingReturn {
	const { address, isConnected } = useApp()
	const { executeTransaction } = useTransaction()
	const { user: twitterUser } = useTwitter()

	const [isProcessing, setIsProcessing] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)

	const isMigrated = pool.migrated === true

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

	const buy = async (amountInSui: string, slippagePercent = 15) => {
		if (!isConnected || !address) {
			setError("WALLET::NOT_CONNECTED")
			return
		}

		const amount = parseFloat(amountInSui)
		if (!amount || amount <= 0) {
			setError("AMOUNT::INVALID")
			return
		}

		if (!isMigrated && (pool.canMigrate || parseInt(pool.bondingCurve) >= 100)) {
			setError('TOKEN::MIGRATING')
			return
		}

		setIsProcessing(true)
		setError(null)
		setSuccess(null)

		try {
			const amountInMist = BigInt(Math.floor(amount * Number(MIST_PER_SUI)))

			if (isMigrated) {
				const quote = await getBuyQuote(pool.coinType, amountInMist, slippagePercent)

				const tx = await buyMigratedToken({
					tokenType: pool.coinType,
					suiAmount: amountInMist,
					address,
					slippagePercentage: slippagePercent,
					referrer: referrerWallet ?? undefined,
				})

				await executeTransaction(tx)
				playSound("buy")

				const tokenAmount = Number(quote.amountOut) / Math.pow(10, decimals)
				setSuccess(
					`ORDER::FILLED - Bought ${tokenAmount.toFixed(2)} ${pool.coinMetadata?.symbol || "TOKEN"} for ${amount} SUI via Aftermath`
				)
			} else {
				if (pool.isProtected) {
					try {
						const response = await fetch(`/api/token-protection/settings/${pool.poolId}`)
						if (response.ok) {
							const { settings } = await response.json()

							if (settings?.maxHoldingPercent) {
								const currentBalance = await fetchCoinBalance(address, pool.coinType)
								const currentBalanceBigInt = BigInt(currentBalance)

								const quote = await pumpSdk.quotePump({
									pool: pool.poolId,
									amount: amountInMist,
								})

								const totalSupplyHuman = Number(TOTAL_POOL_SUPPLY) / Math.pow(10, decimals)
								const currentBalanceHuman = Number(currentBalanceBigInt) / Math.pow(10, decimals)
								const quoteAmountOutHuman = Number(quote.memeAmountOut) / Math.pow(10, decimals)
								const totalBalanceAfterHuman = currentBalanceHuman + quoteAmountOutHuman

								const percentageAfter = (totalBalanceAfterHuman / totalSupplyHuman) * 100

								if (percentageAfter > settings.maxHoldingPercent) {
									setError(`MAX::HOLDING_EXCEEDED - This purchase would give you ${percentageAfter.toFixed(2)}% of total supply, exceeding the ${settings.maxHoldingPercent}% limit`)
									return
								}
							}
						}
					} catch (error) {
						console.error("Failed to check max holding:", error)
					}
				}

				const quote = await pumpSdk.quotePump({
					pool: pool.poolId,
					amount: amountInMist,
				})

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
				playSound("buy")

				const tokenAmount = Number(quote.memeAmountOut) / Math.pow(10, decimals)
				setSuccess(
					`ORDER::FILLED - Bought ${tokenAmount.toFixed(2)} ${pool.coinMetadata?.symbol || "TOKEN"} for ${amount} SUI`
				)
			}
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "UNKNOWN_ERROR"
			setError(errorMessage)
			throw err
		} finally {
			setIsProcessing(false)
		}
	}

	const sell = async (amountInTokens: string, slippagePercent = 15) => {
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
			if (isMigrated) {
				const quote = await getSellQuote(pool.coinType, amountInSmallestUnit, slippagePercent)

				const tx = await sellMigratedToken({
					tokenType: pool.coinType,
					tokenAmount: amountInSmallestUnit,
					address,
					slippagePercentage: slippagePercent,
					referrer: referrerWallet ?? undefined,
				})

				await executeTransaction(tx)
				playSound("sell")
				setSuccess(
					`ORDER::FILLED - Sold ${amount} ${pool.coinMetadata?.symbol || "TOKEN"} for ${formatMistToSui(quote.amountOut)} SUI via Aftermath`
				)
			} else {
				const quote = await pumpSdk.quoteDump({
					pool: pool.poolId,
					amount: amountInSmallestUnit,
				})

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
				playSound("sell")
				setSuccess(
					`ORDER::FILLED - Sold ${amount} ${pool.coinMetadata?.symbol || "TOKEN"} for ${formatMistToSui(quote.quoteAmountOut)} SUI`
				)
			}
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
		buy,
		sell,
	}
}