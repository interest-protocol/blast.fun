"use client"

import { ArrowRight, Zap } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/utils"
import { useTrading } from "@/hooks/pump/use-trading"
import { useRouter } from "next/navigation"
import { fetchTokenByPool } from "@/lib/fetch-token-by-pool"
import type { Token } from "@/types/token"

interface DevBuyProps {
	poolObjectId: string
	className?: string
}

const QUICK_BUY_AMOUNTS = [0.1, 0.5, 1, 5]

export function DevBuy({ poolObjectId, className }: DevBuyProps) {
	const [customAmount, setCustomAmount] = useState("")
	const [token, setToken] = useState<Token | null>(null)
	const router = useRouter()

	const { buy, isProcessing } = useTrading({
		pool: token || {
			id: poolObjectId,
			coinType: "",
			pool: { poolId: poolObjectId, migrated: false, bondingCurve: 0 }
		} as Token
	})

	useEffect(() => {
		async function loadToken() {
			const tokenData = await fetchTokenByPool(poolObjectId)
			if (tokenData) {
				setToken({
					...tokenData,
					pool: {
						poolId: tokenData.id,
						isProtected: !!tokenData.publicKey,
						burnTax: tokenData.burnTax,
						migrated: tokenData.migrated || false,
						bondingCurve: 0,
						canMigrate: tokenData.canMigrate || false,
					}
				} as Token)
			}
		}
		loadToken()
	}, [poolObjectId])

	const handleQuickBuy = async (amountInSui: number) => {
		try {
			await buy(String(amountInSui))
			router.push(`/token/${poolObjectId}`)
		} catch (error) {
			console.error("Quick buy failed:", error)
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
					DEV::BUY
				</p>
				<button
					onClick={() => router.push(`/token/${poolObjectId}`)}
					className="font-mono text-xs uppercase text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
					disabled={isProcessing}
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
						disabled={isProcessing || !token}
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
						disabled={isProcessing || !token}
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
					disabled={isProcessing || !customAmount || parseFloat(customAmount) <= 0 || !token}
				>
					<Zap className="h-3 w-3" />
				</Button>
			</div>
		</div>
	)
}
