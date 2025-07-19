"use client"

import React from "react"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Zap, Target } from "lucide-react"
import type { PoolWithMetadata } from "@/types/pool"
import { formatAmountWithSuffix } from "@/utils/format"

interface BondingProgressProps {
	pool: PoolWithMetadata
}

export function BondingProgress({ pool }: BondingProgressProps) {
	// calculate bonding curve progress
	const progress = typeof pool.bondingCurve === "number" ? pool.bondingCurve : parseFloat(pool.bondingCurve) || 0

	const currentLiquidity = Number(pool.quoteBalance) / Math.pow(10, 9)
	const targetLiquidity = Number(pool.targetQuoteLiquidity) / Math.pow(10, 9)

	// calculate remaining amount needed
	const remainingLiquidity = Math.max(0, targetLiquidity - currentLiquidity)

	return (
		<div className="border-2 bg-background/50 backdrop-blur-sm rounded-lg">
			<div className="p-4 border-b">
				<h3 className="text-lg font-mono uppercase tracking-wider">BONDING::CURVE</h3>
			</div>
			<div className="p-4 space-y-4">
				{/* Progress Bar */}
				<div className="space-y-2">
					<div className="flex justify-between items-center">
						<span className="font-mono text-xs uppercase text-muted-foreground">PROGRESS</span>
						<span className="font-mono text-xs uppercase">{progress.toFixed(2)}%</span>
					</div>
					<div className="relative">
						<Progress value={progress} className="h-4 bg-background border" />
						{/* Animated Glow Effect */}
						<div
							className="absolute inset-0 h-4 bg-primary/20 blur-sm transition-all duration-500"
							style={{ width: `${progress}%` }}
						/>
					</div>
				</div>

				{/* Liquidity Stats */}
				<div className="grid grid-cols-3 gap-2">
					<div className="p-2 border rounded bg-background/30">
						<div className="flex items-center gap-1 mb-1">
							<Zap className="w-3 h-3 text-muted-foreground" />
							<p className="font-mono text-xs uppercase text-muted-foreground">CURRENT</p>
						</div>
						<p className="font-mono text-sm font-bold">{currentLiquidity.toLocaleString()} SUI</p>
					</div>

					<div className="p-2 border rounded bg-background/30">
						<div className="flex items-center gap-1 mb-1">
							<Target className="w-3 h-3 text-muted-foreground" />
							<p className="font-mono text-xs uppercase text-muted-foreground">TARGET</p>
						</div>
						<p className="font-mono text-sm font-bold">{targetLiquidity.toLocaleString()} SUI</p>
					</div>

					<div className="p-2 border rounded bg-background/30">
						<div className="flex items-center gap-1 mb-1">
							<TrendingUp className="w-3 h-3 text-muted-foreground" />
							<p className="font-mono text-xs uppercase text-muted-foreground">REMAINING</p>
						</div>
						<p className="font-mono text-sm font-bold">{remainingLiquidity.toLocaleString()} SUI</p>
					</div>
				</div>
			</div>
		</div>
	)
}
