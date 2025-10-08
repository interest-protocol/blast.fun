"use client"

import { Loader2 } from "lucide-react"
import { useApp } from "@/context/app.context"
import { useTrading } from "@/hooks/pump/use-trading"
import { usePresetStore } from "@/stores/preset-store"
import type { Token } from "@/types/token"
import { cn } from "@/utils"

interface QuickBuyProps {
	pool: Token
	className?: string
}

export function QuickBuy({ pool, className }: QuickBuyProps) {
	const { isConnected } = useApp()
	const { flashBuyAmount, slippage } = usePresetStore()
	console.log(pool)
	const { buy, isProcessing } = useTrading({ pool })

	const handleQuickBuy = async (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()

		try {
			await buy(flashBuyAmount.toString(), slippage)
		} catch (error) {
			console.log(error)
		}
	}

	if (!isConnected) {
		return null
	}

	return (
		<div
			className={cn("flex items-center gap-1.5", className)}
			onClick={(e) => e.stopPropagation()}
		>
			<button
				onClick={handleQuickBuy}
				disabled={isProcessing}
				className={cn(
					"flex items-center gap-1 rounded-lg border px-2 py-1.5 font-mono text-[10px] transition-all",
					"border-blue-500/30 bg-blue-500/10 text-blue-400",
					"hover:border-blue-500/60 hover:bg-blue-500/20",
					"disabled:cursor-not-allowed disabled:opacity-50",
					isProcessing && "bg-blue-500/30"
				)}
			>
				{isProcessing ? (
					<Loader2 className="h-3 w-3 animate-spin" />
				) : (
					<>
						<img src="/assets/currency/sui-fill.svg" alt="SUI" width={12} height={12} className="shrink-0" />
						<span className="font-semibold">{flashBuyAmount}</span>
					</>
				)}
			</button>
		</div>
	)
}
