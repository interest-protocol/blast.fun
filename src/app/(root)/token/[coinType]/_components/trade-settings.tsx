"use client"

import { Zap } from "lucide-react"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { usePresetStore } from "@/stores/preset-store"
import { cn } from "@/utils"

interface TradeSettingsProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function TradeSettings({ open, onOpenChange }: TradeSettingsProps) {
	const { slippage, quickBuyAmounts, quickSellPercentages, setSlippage, setQuickBuyAmounts, setQuickSellPercentages } =
		usePresetStore()

	// local state for editing
	const [localSlippage, setLocalSlippage] = useState(slippage)
	const [localQuickBuyAmounts, setLocalQuickBuyAmounts] = useState(quickBuyAmounts)
	const [localQuickSellPercentages, setLocalQuickSellPercentages] = useState(quickSellPercentages)

	// reset local state when dialog opens
	useEffect(() => {
		if (open) {
			setLocalSlippage(slippage)
			setLocalQuickBuyAmounts(quickBuyAmounts)
			setLocalQuickSellPercentages(quickSellPercentages)
		}
	}, [open, slippage, quickBuyAmounts, quickSellPercentages])

	// auto-save when closing the dialog
	const handleClose = (newOpen: boolean) => {
		if (!newOpen) {
			setSlippage(localSlippage)
			setQuickBuyAmounts(localQuickBuyAmounts)
			setQuickSellPercentages(localQuickSellPercentages)
		}

		onOpenChange(newOpen)
	}

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="border-border bg-background sm:max-w-[420px]">
				<DialogHeader>
					<DialogTitle className="font-mono text-sm uppercase">Trade Settings</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Zap className="h-3 w-3 text-yellow-500" />
								<span className="text-sm">Slippage Tolerance</span>
							</div>
							<div className="relative w-24">
								<input
									type="number"
									value={localSlippage}
									onChange={(e) => setLocalSlippage(Number(e.target.value))}
									className="w-full rounded border border-border bg-muted/50 px-2 py-1 pr-6 text-center text-sm focus:border-primary focus:outline-none"
									min={0}
									max={100}
								/>
								<span className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-2 text-muted-foreground text-sm">
									%
								</span>
							</div>
						</div>
						<div className="grid grid-cols-5 gap-1">
							{[5, 10, 15, 20, 30].map((val) => (
								<button
									key={val}
									onClick={() => setLocalSlippage(val)}
									className={cn(
										"rounded-md border py-1 text-xs transition-all",
										localSlippage === val
											? "border-primary bg-primary text-primary-foreground"
											: "border-border hover:border-primary/50"
									)}
								>
									{val}%
								</button>
							))}
						</div>
					</div>

					{/* Quick Buy Amounts */}
					<div className="space-y-3">
						<div className="text-center font-mono text-muted-foreground text-xs uppercase">
							Quick Buy Amounts (SUI)
						</div>
						<div className="grid grid-cols-4 gap-2">
							{localQuickBuyAmounts.map((amount, index) => (
								<div key={index} className="relative">
									<input
										type="number"
										value={amount}
										onChange={(e) => {
											const newAmounts = [...localQuickBuyAmounts]
											newAmounts[index] = Number(e.target.value)
											setLocalQuickBuyAmounts(newAmounts)
										}}
										className="w-full rounded border border-border bg-muted/50 px-2 py-2 text-center text-xs focus:border-primary focus:outline-none"
										step={0.01}
										min={0}
									/>
								</div>
							))}
						</div>
					</div>

					{/* Quick Sell Percentages */}
					<div className="space-y-3">
						<div className="text-center font-mono text-muted-foreground text-xs uppercase">
							Quick Sell Percentages
						</div>
						<div className="grid grid-cols-4 gap-2">
							{localQuickSellPercentages.map((percentage, index) => (
								<div key={index} className="relative">
									<input
										type="number"
										value={percentage}
										onChange={(e) => {
											const newPercentages = [...localQuickSellPercentages]
											newPercentages[index] = Number(e.target.value)
											setLocalQuickSellPercentages(newPercentages)
										}}
										className="w-full rounded border border-border bg-muted/50 px-2 py-2 pr-6 text-center text-xs focus:border-primary focus:outline-none"
										step={1}
										min={1}
										max={100}
									/>
									<span className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-1.5 text-muted-foreground text-xs">
										%
									</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
