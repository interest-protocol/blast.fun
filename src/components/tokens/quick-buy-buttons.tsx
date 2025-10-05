"use client"

import { useState, useRef } from "react"
import { Loader2 } from "lucide-react"
import { Transaction } from "@mysten/sui/transactions"
import { MIST_PER_SUI } from "@mysten/sui/utils"
import BigNumber from "bignumber.js"
import { useDebouncedCallback } from "use-debounce"
import { useApp } from "@/context/app.context"
import { usePresetStore } from "@/stores/preset-store"
import { useTransaction } from "@/hooks/sui/use-transaction"
import { useQuickBuyData } from "@/hooks/use-quick-buy-data"
import type { Token } from "@/types/token"
import { cn } from "@/utils"
import toast from "react-hot-toast"
import { pumpSdk } from "@/lib/pump"
import { buyMigratedToken, getBuyQuote } from "@/lib/aftermath"
import { playSound } from "@/lib/audio"

type QuickBuyStage = 'idle' | 'fetching' | 'quoting' | 'building' | 'confirming'

interface QuickBuyButtonsProps {
	pool: Token
	className?: string
}

export function QuickBuyButtons({ pool, className }: QuickBuyButtonsProps) {
	const { isConnected, address } = useApp()
	const { quickBuyAmounts } = usePresetStore()
	const { executeTransaction } = useTransaction()
	const [processingAmount, setProcessingAmount] = useState<number | null>(null)
	const [buyStage, setBuyStage] = useState<QuickBuyStage>('idle')
	const processingRequests = useRef(new Set<string>())

	const { data: cachedPoolData, refetch } = useQuickBuyData(pool.coinType, false)

	const prefetchPoolData = useDebouncedCallback(() => {
		if (!cachedPoolData) {
			refetch()
		}
	}, 300)

	const handleQuickBuy = async (amount: number, e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()

		if (!isConnected || !address) {
			toast.error("Connect wallet to buy")
			return
		}

		const requestId = `${pool.coinType}-${amount}`
		if (processingRequests.current.has(requestId)) {
			toast.error("Transaction already in progress")
			return
		}

		processingRequests.current.add(requestId)
		setProcessingAmount(amount)
		setBuyStage('fetching')

		try {
			const poolData = cachedPoolData || (await refetch()).data

			if (!poolData || !poolData.poolId) {
				throw new Error("Pool ID not found")
			}

			const { poolId, decimals, symbol, migrated } = poolData

			const amountBN = new BigNumber(amount)
			const mistPerSuiBN = new BigNumber(MIST_PER_SUI.toString())
			const amountInMistBN = amountBN.multipliedBy(mistPerSuiBN).integerValue(BigNumber.ROUND_DOWN)
			const amountInMist = BigInt(amountInMistBN.toString())

			setBuyStage('quoting')

			if (migrated) {
				const quote = await getBuyQuote(pool.coinType, amountInMist, 15)

				setBuyStage('building')

				const tx = await buyMigratedToken({
					tokenType: pool.coinType,
					suiAmount: amountInMist,
					address,
					slippagePercentage: 15,
				})

				setBuyStage('confirming')

				await executeTransaction(tx)

				playSound("buy")

				const tokenAmount = Number(quote.amountOut) / Math.pow(10, decimals)
				toast.success(`Bought ${tokenAmount.toFixed(2)} ${symbol} for ${amount} SUI via Aftermath`)
			} else {
				const quote = await pumpSdk.quotePump({
					pool: poolId,
					amount: amountInMist,
				})

				setBuyStage('building')

				const slippagePercent = 5
				const slippageMultiplier = new BigNumber(1).minus(new BigNumber(slippagePercent).dividedBy(100))
				const quoteAmountBN = new BigNumber(quote.memeAmountOut.toString())
				const minAmountOutBN = quoteAmountBN.multipliedBy(slippageMultiplier).integerValue(BigNumber.ROUND_DOWN)
				const minAmountOut = BigInt(minAmountOutBN.toString())

				const tx = new Transaction()
				const quoteCoin = tx.splitCoins(tx.gas, [tx.pure.u64(amountInMist)])

				const { memeCoin, tx: pumpTx } = await pumpSdk.pump({
					tx,
					pool: poolId,
					quoteCoin,
					minAmountOut,
				})

				pumpTx.transferObjects([memeCoin], address)

				setBuyStage('confirming')

				await executeTransaction(pumpTx)

				playSound("buy")

				const tokenAmount = Number(quote.memeAmountOut) / Math.pow(10, decimals)
				toast.success(`Bought ${tokenAmount.toFixed(2)} ${symbol} for ${amount} SUI`)
			}
		} catch (error: any) {
			console.error("Quick buy failed:", error)
			toast.error(error?.message || "Buy failed")
		} finally {
			setProcessingAmount(null)
			setBuyStage('idle')
			processingRequests.current.delete(requestId)
		}
	}

	if (!isConnected) {
		return null
	}

	const displayAmounts = quickBuyAmounts.slice(0, 3)

	const getStageLabel = (stage: QuickBuyStage) => {
		switch (stage) {
			case 'fetching': return 'Vibing'
			case 'quoting': return 'Aping'
			case 'building': return 'Send It!'
			case 'confirming': return 'Cooking'
			default: return null
		}
	}

	return (
		<div
			className={cn("flex items-center gap-1", className)}
			onClick={(e) => e.stopPropagation()}
			onMouseEnter={prefetchPoolData}
		>
			{displayAmounts.map((amount) => (
				<button
					key={amount}
					onClick={(e) => handleQuickBuy(amount, e)}
					disabled={processingAmount !== null}
					className={cn(
						"px-2 py-1 text-[10px] font-mono font-semibold rounded border transition-all",
						"border-green-500/40 bg-green-500/10 text-green-400",
						"hover:bg-green-500/20 hover:border-green-500/60",
						"disabled:opacity-50 disabled:cursor-not-allowed",
						processingAmount === amount && "bg-green-500/30"
					)}
				>
					{processingAmount === amount ? (
						<div className="flex items-center gap-1">
							<Loader2 className="h-3 w-3 animate-spin" />
							{getStageLabel(buyStage) && (
								<span className="text-[8px]">{getStageLabel(buyStage)}</span>
							)}
						</div>
					) : (
						`${amount}`
					)}
				</button>
			))}
		</div>
	)
}
