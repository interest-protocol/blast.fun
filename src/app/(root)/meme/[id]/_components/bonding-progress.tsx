"use client"

import { Rocket } from "lucide-react"
import type { PoolWithMetadata } from "@/types/pool"
import { cn } from "@/utils"
import { useBondingProgress } from "@/hooks/use-bonding-progress"

interface BondingProgressProps {
	pool: PoolWithMetadata
}

export function BondingProgress({ pool }: BondingProgressProps) {
	const { data } = useBondingProgress(pool.coinType)
	
	// Use real-time data if available, otherwise fall back to pool data
	const progress = data?.progress ?? (typeof pool.bondingCurve === "number" ? pool.bondingCurve : parseFloat(pool.bondingCurve) || 0)

	const isNearCompletion = progress >= 80
	const isComplete = progress >= 100

	return (
		<div className="border-2 shadow-lg rounded-xl p-3 overflow-hidden">
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Rocket className={cn(
							"w-4 h-4",
							isComplete ? "text-green-500" : "text-primary/60"
						)} />
						<span className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider">
							BONDING::PROGRESS
						</span>
					</div>

					<div className="flex items-center gap-2 text-xs sm:text-sm font-mono">
						<span className={cn(
							"font-bold",
							isComplete
								? "text-green-500"
								: isNearCompletion
									? "text-primary"
									: "text-primary/80"
						)}>
							{progress}%
						</span>
					</div>
				</div>

				<div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/30 border border-border/50">
					<div
						className="absolute left-0 top-0 h-full transition-all duration-500 ease-out"
						style={{ width: `${Math.min(progress, 100)}%` }}
					>
						<div className="h-full bg-gradient-to-r from-primary/60 via-primary to-emerald-500 shadow-lg shadow-primary/20" />
					</div>
				</div>
			</div>
		</div>
	)
}