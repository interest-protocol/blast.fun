import { coinWithBalance, Transaction } from "@mysten/sui/transactions"
import { MIST_PER_SUI, fromHex } from "@mysten/sui/utils"
import { useState, useEffect } from "react"
import BigNumber from "bignumber.js"
import { useApp } from "@/context/app.context"
import { useTransaction } from "@/hooks/sui/use-transaction"
import { playSound } from "@/lib/audio"
import { pumpSdk } from "@/lib/pump"
import { buyMigratedToken, sellMigratedToken, getBuyQuote, getSellQuote } from "@/lib/aftermath"
import type { Token } from "@/types/token"
import { formatMistToSui } from "@/utils/format"
import { useTwitter } from "@/context/twitter.context"
import { useTurnstile } from "@/context/turnstile.context"
import { TOTAL_POOL_SUPPLY } from "@/constants"
import { fetchCoinBalance } from "@/lib/fetch-portfolio"

const SLIPPAGE_TOLERANCE_ERROR = "Error: Slippage tolerance exceeded. Transaction reverted."

interface UseTradingOptions {
	pool: Token
	decimals?: number
	actualBalance?: string
	referrerWallet?: string | null
}

interface UseTradingReturn {
	isProcessing: boolean
	error: string | null
	success: string | null
	buy: (amountInSui: string, slippagePercent?: number, turnstileToken?: string) => Promise<void>
	sell: (amountInTokens: string, slippagePercent?: number) => Promise<void>
	clearError: () => void
}

export function useTrading({ pool, decimals = 9, actualBalance, referrerWallet }: UseTradingOptions): UseTradingReturn {
	const { address, isConnected } = useApp()
	const { executeTransaction } = useTransaction()
	const { refreshToken } = useTurnstile()

	const [isProcessing, setIsProcessing] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)

	const isMigrated = pool.pool?.migrated === true

	const clearError = () => {
		setError(null)
	}

	useEffect(() => {
		if (success) {
			const timer = setTimeout(() => {
				setSuccess(null)
			}, 5000)
			return () => clearTimeout(timer)
		}
	}, [success])

	const getProtectedPoolSignature = async (amount: string, turnstileToken?: string) => {
		if (!pool.pool?.isProtected) return null

		try {
			const response = await fetch("/api/token-protection/signature", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					poolId: pool.pool?.poolId || pool.id,
					amount,
					walletAddress: address,
					turnstileToken,
					coinType: pool.coinType,
					decimals: decimals,
					// Twitter credentials are now obtained from the authenticated session on the server
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

	const buy = async (amountInSui: string, slippagePercent = 15, turnstileToken?: string) => {
		if (!isConnected || !address) {
			setError("WALLET::NOT_CONNECTED")
			return
		}

		const amount = parseFloat(amountInSui)
		if (!amount || amount <= 0) {
			setError("AMOUNT::INVALID")
			return
		}

		// const suiBalanceNum = parseFloat(suiBalance || "0")
		// if (suiBalanceNum < amount) {
		// 	const deficit = amount - suiBalanceNum
		// 	setError(`INSUFFICIENT::SUI - You need ${deficit.toFixed(2)} more SUI`)
		// 	return
		// }

		if (!isMigrated && (pool.pool?.canMigrate || (pool.pool?.bondingCurve || 0) >= 100)) {
			setError('TOKEN::MIGRATING')
			return
		}

		setIsProcessing(true)
		setError(null)
		setSuccess(null)

		try {
			const amountBN = new BigNumber(amount)
			const mistPerSuiBN = new BigNumber(MIST_PER_SUI.toString())
			const amountInMistBN = amountBN.multipliedBy(mistPerSuiBN).integerValue(BigNumber.ROUND_DOWN)
			const amountInMist = BigInt(amountInMistBN.toString())

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
					`ORDER::FILLED - Bought ${tokenAmount.toFixed(2)} ${pool.metadata?.symbol || "TOKEN"} for ${amount} SUI via Aftermath`
				)
			} else {
				if (pool.pool?.isProtected) {
					try {
						const response = await fetch(`/api/token-protection/settings/${pool.pool?.poolId || pool.id}`, {
							headers: {
								'cloudflare-cache': '3600',
								'cache-control': 'no-store'
							}
						})
						if (response.ok) {
							const { settings } = await response.json()

							if (settings?.maxHoldingPercent) {
								const currentBalance = await fetchCoinBalance(address, pool.coinType)
								const currentBalanceBigInt = BigInt(currentBalance)

								const quote = await pumpSdk.quotePump({
									pool: pool.pool?.poolId || pool.id,
									amount: amountInMist,
								})

								const totalSupplyHuman = Number(TOTAL_POOL_SUPPLY) / Math.pow(10, decimals)
								const currentBalanceHuman = Number(currentBalanceBigInt) / Math.pow(10, decimals)
								const quoteAmountOutHuman = Number(quote.memeAmountOut) / Math.pow(10, decimals)
								const totalBalanceAfterHuman = currentBalanceHuman + quoteAmountOutHuman

								const percentageAfter = (totalBalanceAfterHuman / totalSupplyHuman) * 100

								if (percentageAfter > Number(settings.maxHoldingPercent)) {
									// Don't block the transaction, let backend handle it
									// Frontend check is just for user experience - backend will enforce
									console.log(`Frontend warning: Purchase would exceed max holding limit (${percentageAfter.toFixed(2)}% > ${settings.maxHoldingPercent}%)`)
								}
							}
						}
					} catch (error) {
						console.error("Failed to check max holding:", error)
					}
				}

				const quote = await pumpSdk.quotePump({
					pool: pool.pool?.poolId || pool.id,
					amount: amountInMist,
				})

				const slippageMultiplier = new BigNumber(1).minus(new BigNumber(slippagePercent).dividedBy(100))
				const quoteAmountBN = new BigNumber(quote.memeAmountOut.toString())
				const minAmountOutBN = quoteAmountBN.multipliedBy(slippageMultiplier).integerValue(BigNumber.ROUND_DOWN)
				const minAmountOut = BigInt(minAmountOutBN.toString())

				const tx = new Transaction()
				const quoteCoin = tx.splitCoins(tx.gas, [tx.pure.u64(amountInMist)])

				const signatureData = await getProtectedPoolSignature(amountInSui, turnstileToken)
				const { memeCoin, tx: pumpTx } = await pumpSdk.pump({
					tx,
					pool: pool.pool?.poolId || pool.id,
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
					`ORDER::FILLED - Bought ${tokenAmount.toFixed(2)} ${pool.metadata?.symbol || "TOKEN"} for ${amount} SUI`
				)
			}
		} catch (err) {
			let errorMessage = err instanceof Error ? err.message : "UNKNOWN_ERROR"
			if(errorMessage.includes("MoveAbort") && errorMessage.includes(", 3)")) {
				errorMessage = SLIPPAGE_TOLERANCE_ERROR
			}
			setError(errorMessage)
			throw err
		} finally {
			setIsProcessing(false)
			refreshToken()
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

		const amountBN = new BigNumber(amount)
		const decimalMultiplier = new BigNumber(10).pow(decimals)
		const amountInSmallestUnitBN = amountBN.multipliedBy(decimalMultiplier)
		let amountInSmallestUnit = BigInt(amountInSmallestUnitBN.integerValue(BigNumber.ROUND_DOWN).toString())

		if (actualBalance) {
			const actualBalanceBN = new BigNumber(actualBalance)
			const actualBalanceInDisplayUnit = actualBalanceBN.dividedBy(decimalMultiplier)
			const actualBalanceBigInt = BigInt(actualBalance)

			// Check if trying to sell exact balance by comparing display strings
			const inputString = amountBN.toFixed()
			const balanceString = actualBalanceInDisplayUnit.toFixed()
			const isExactBalance = inputString === balanceString

			// Also check if the input is very close to the balance (within 0.000000001%)
			const ratio = amountBN.dividedBy(actualBalanceInDisplayUnit)
			const isNearExact = ratio.isGreaterThanOrEqualTo(0.99999999) && ratio.isLessThanOrEqualTo(1.00000001)

			if (isExactBalance || isNearExact) {
				// If selling exact balance, use the actual balance directly
				amountInSmallestUnit = actualBalanceBigInt
			} else if (amountInSmallestUnit > actualBalanceBigInt) {
				setError(`You don't have enough for this. You only have ${actualBalanceInDisplayUnit.toFixed()} ${pool.metadata?.symbol || "TOKEN"}`)
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
					`ORDER::FILLED - Sold ${amount} ${pool.metadata?.symbol || "TOKEN"} for ${formatMistToSui(String(quote.amountOut))} SUI via Aftermath`
				)
			} else {
				// For non-migrated tokens, amountInSmallestUnit has already been set correctly
				// in the balance check above (either exact balance or the calculated amount)
				const amountToSell = amountInSmallestUnit
				const quote = await pumpSdk.quoteDump({
					pool: pool.pool?.poolId || pool.id,
					amount: amountToSell,
				})

				const slippageMultiplier = new BigNumber(1).minus(new BigNumber(slippagePercent).dividedBy(100))
				const quoteAmountOutBN = new BigNumber(quote.quoteAmountOut.toString())
				const minAmountOutBN = quoteAmountOutBN.multipliedBy(slippageMultiplier).integerValue(BigNumber.ROUND_DOWN)
				const minAmountOut = BigInt(minAmountOutBN.toString())

				const tx = new Transaction()
				tx.setSender(address)

				const memeCoin = coinWithBalance({
					balance: amountToSell,
					type: pool.coinType,
				})(tx)

				const { quoteCoin, tx: dumpTx } = await pumpSdk.dump({
					tx,
					pool: pool.pool?.poolId || pool.id,
					memeCoin,
					minAmountOut,
					referrer: referrerWallet ?? undefined
				})

				dumpTx.transferObjects([quoteCoin], address)

				await executeTransaction(dumpTx)
				playSound("sell")

				setSuccess(
					`ORDER::FILLED - Sold ${amount} ${pool.metadata?.symbol || "TOKEN"} for ${formatMistToSui(String(quote.quoteAmountOut))} SUI`
				)
			}
		} catch (err) {
			let errorMessage = err instanceof Error ? err.message : "UNKNOWN_ERROR"
			if(errorMessage.includes("MoveAbort") && errorMessage.includes(", 3)")) {
				errorMessage = SLIPPAGE_TOLERANCE_ERROR
			}
			setError(errorMessage)
			throw err
		} finally {
			setIsProcessing(false)
			refreshToken()
		}
	}

	return {
		isProcessing,
		error,
		success,
		buy,
		sell,
		clearError,
	}
}