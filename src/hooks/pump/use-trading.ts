import { coinWithBalance, Transaction } from "@mysten/sui/transactions"
import { MIST_PER_SUI, fromHex } from "@mysten/sui/utils"
import { useState, useEffect } from "react"
import BigNumber from "bignumber.js"
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

		// const suiBalanceNum = parseFloat(suiBalance || "0")
		// if (suiBalanceNum < amount) {
		// 	const deficit = amount - suiBalanceNum
		// 	setError(`INSUFFICIENT::SUI - You need ${deficit.toFixed(2)} more SUI`)
		// 	return
		// }

		if (!isMigrated && (pool.canMigrate || parseInt(pool.bondingCurve) >= 100)) {
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

				const slippageMultiplier = new BigNumber(1).minus(new BigNumber(slippagePercent).dividedBy(100))
				const quoteAmountBN = new BigNumber(quote.memeAmountOut.toString())
				const minAmountOutBN = quoteAmountBN.multipliedBy(slippageMultiplier).integerValue(BigNumber.ROUND_DOWN)
				const minAmountOut = BigInt(minAmountOutBN.toString())

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

		const amountBN = new BigNumber(amount)
		const decimalMultiplier = new BigNumber(10).pow(decimals)
		const amountInSmallestUnitBN = amountBN.multipliedBy(decimalMultiplier).integerValue(BigNumber.ROUND_HALF_UP)
		const amountInSmallestUnit = BigInt(amountInSmallestUnitBN.toString())

		if (actualBalance) {
			const actualBalanceBN = new BigNumber(actualBalance)
			const actualBalanceNumber = actualBalanceBN.dividedBy(decimalMultiplier).toNumber()
			const actualBalanceBigInt = BigInt(actualBalance)

			if (amountInSmallestUnit > actualBalanceBigInt) {
				setError(`You don't have enough for this. You only have ${actualBalanceNumber.toFixed(4)} ${pool.coinMetadata?.symbol || "TOKEN"}`)
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
				let amountToSell: bigint
				let isSellingAll = false

				if (actualBalance) {
					const actualBalanceBN = new BigNumber(actualBalance)
					const actualBalanceNumber = actualBalanceBN.dividedBy(decimalMultiplier).toNumber()

					// check if user is trying to sell all (within 0.01% tolerance)
					const amountDiff = new BigNumber(amount).minus(actualBalanceNumber).abs()
					const tolerance = new BigNumber(actualBalanceNumber).multipliedBy(0.0001)
					isSellingAll = amountDiff.isLessThanOrEqualTo(tolerance)

					if (isSellingAll) {
						const sellPercentage = new BigNumber("0.999")
						const amountToSellBN = actualBalanceBN.multipliedBy(sellPercentage).integerValue(BigNumber.ROUND_DOWN)
						amountToSell = BigInt(amountToSellBN.toString())
						console.log(`[Trading] Selling 99.9% of balance to avoid dust issues: ${amountToSell}`)
					} else {
						amountToSell = amountInSmallestUnit
					}
				} else {
					amountToSell = amountInSmallestUnit
				}

				const quote = await pumpSdk.quoteDump({
					pool: pool.poolId,
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