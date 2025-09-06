"use client"

import { useBondingProgress } from "@/hooks/use-bonding-progress"
import type { Token } from "@/types/token"

interface BondingProgressProps {
	pool: Token
}

export function BondingProgress({ pool }: BondingProgressProps) {
	const { data } = useBondingProgress(pool.coinType)

	// Use real-time data if available, otherwise fall back to pool data
	const progress = data?.progress ?? (pool.market?.bondingProgress || 0)

	return (
		<div className="relative border-border border-b">
			<div className="space-y-3 p-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						{/* Indicator */}
						<div className="relative flex items-center justify-center">
							<div className="absolute h-2 w-2 animate-pulse rounded-full bg-blue-400" />
							<div className="h-2 w-2 rounded-full bg-blue-400" />
						</div>

						<div className="flex flex-col">
							<p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
								Bonding Curve Progress
							</p>
							<div className="flex items-center gap-2">
								<span className="font-bold font-mono text-foreground text-sm">
									{Math.round(progress)}% Complete
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Progress Bar */}
				<div className="relative h-2 w-full overflow-hidden rounded-full border border-border/50 bg-muted/20">
					<div
						className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400/60 to-blue-400 transition-all duration-500 ease-out"
						style={{ width: `${Math.min(progress, 100)}%` }}
					/>
				</div>
			</div>
		</div>
	)
}
