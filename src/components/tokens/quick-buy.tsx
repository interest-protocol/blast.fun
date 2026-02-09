"use client"

import { Loader2 } from "lucide-react"
import { useApp } from "@/context/app.context"
import { useTrading } from "@/hooks/pump/use-trading"
import { usePresetStore } from "@/stores/preset-store"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { Token } from "@/types/token"
import { cn } from "@/utils"

interface QuickBuyProps {
	pool: Token
	className?: string
	column?: "newlyCreated" | "nearGraduation" | "graduated"
}

export function QuickBuy({ pool, className, column }: QuickBuyProps) {
	const { isConnected } = useApp()
	const { flashBuyAmounts, slippage } = usePresetStore()
	const { buy, isProcessing, canTrade } = useTrading({ pool })

	// use column-specific flash buy amount, fallback to newlyCreated if no column specified
	const flashBuyAmount = column ? flashBuyAmounts[column] : flashBuyAmounts.newlyCreated

	const handleQuickBuy = async (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()

		try {
			await buy(flashBuyAmount.toString(), slippage)
		} catch (error) {
			// error handling is done in trading hook
		}
	}

	if (!isConnected) {
		return null
	}

	const disabled = isProcessing || !canTrade

	return (
		<div
			className={cn("flex items-center gap-1.5", className)}
			onClick={(e) => e.stopPropagation()}
		>
			<Tooltip>
				<TooltipTrigger asChild>
					<button
						onClick={canTrade ? handleQuickBuy : undefined}
						disabled={disabled}
						className={cn(
							"flex items-center gap-1 rounded-lg border px-2 py-1.5 font-mono text-[10px] transition-all",
							"border-blue-500/30 bg-blue-500/10 text-blue-400",
							"hover:border-blue-500/60 hover:bg-blue-500/20",
							"disabled:cursor-not-allowed disabled:opacity-50",
							isProcessing && "bg-blue-500/30",
							!canTrade && "cursor-default"
						)}
					>
						{isProcessing ? (
							<Loader2 className="h-3 w-3 animate-spin" />
						) : (
							<>
								<img
									src="/assets/currency/sui-fill.svg"
									alt="SUI"
									width={12}
									height={12}
									className="shrink-0"
								/>
								<span className="font-semibold">{flashBuyAmount}</span>
							</>
						)}
					</button>
				</TooltipTrigger>
				<TooltipContent side="bottom" className="font-mono text-xs">
					{!canTrade
						? "Open token page to trade"
						: isProcessing
							? "Processing…"
							: `Buy ${flashBuyAmount} SUI`}
				</TooltipContent>
			</Tooltip>
		</div>
	)
}
