"use client"

import { MIST_PER_SUI } from "@mysten/sui/utils"
import { ArrowRight, Zap } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/utils"
import { useBuyMeme } from "@/hooks/pump/use-buy-meme"
import { useRouter } from "next/navigation"

interface QuickBuyProps {
	poolObjectId: string
	className?: string
}

const QUICK_BUY_AMOUNTS = [0.1, 0.5, 1, 5]

export function QuickBuy({ poolObjectId, className }: QuickBuyProps) {
	const [customAmount, setCustomAmount] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const router = useRouter()
	const { handleBuy } = useBuyMeme(poolObjectId)

	const handleQuickBuy = async (amountInSui: number) => {
		setIsLoading(true)
		try {
			const amountInMist = String(amountInSui * Number(MIST_PER_SUI))
			await handleBuy(amountInMist)

			router.push(`/meme/${poolObjectId}`)
		} catch (error) {
			console.error("Quick buy failed:", error)
		} finally {
			setIsLoading(false)
		}
	}

	const handleCustomBuy = async () => {
		const amount = parseFloat(customAmount)
		if (isNaN(amount) || amount <= 0) return

		await handleQuickBuy(amount)
		setCustomAmount("")
	}

	return (
		<div className={cn("space-y-3", className)}>
			<div className="flex items-center justify-between">
				<p className="font-mono text-xs uppercase text-muted-foreground">
					QUICK::BUY
				</p>
				<button
					onClick={() => router.push(`/meme/${poolObjectId}`)}
					className="font-mono text-xs uppercase text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
					disabled={isLoading}
				>
					GO TO TOKEN PAGE <ArrowRight className="h-3 w-3" />
				</button>
			</div>

			{/* Quick amounts */}
			<div className="grid grid-cols-4 gap-2">
				{QUICK_BUY_AMOUNTS.map((amount) => (
					<Button
						key={amount}
						variant="outline"
						size="sm"
						className="font-mono text-xs uppercase border hover:border-primary/50 hover:bg-primary/10 transition-all"
						onClick={() => handleQuickBuy(amount)}
						disabled={isLoading}
					>
						{amount} SUI
					</Button>
				))}
			</div>

			{/* Custom amount */}
			<div className="flex gap-2">
				<div className="relative flex-1">
					<Input
						type="number"
						placeholder="0.0"
						value={customAmount}
						onChange={(e) => setCustomAmount(e.target.value)}
						className="font-mono text-sm pr-10"
						disabled={isLoading}
						step="0.1"
						min="0"
					/>
					<span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground">
						SUI
					</span>
				</div>
				<Button
					variant="outline"
					className={cn(
						"font-mono text-xs uppercase px-4",
						"border-primary/20 hover:border-primary/50",
						"hover:bg-primary/10 transition-all"
					)}
					onClick={handleCustomBuy}
					disabled={isLoading || !customAmount || parseFloat(customAmount) <= 0}
				>
					<Zap className="h-3 w-3" />
				</Button>
			</div>
		</div>
	)
}