"use client"

import type { PoolWithMetadata } from "@/types/pool"

interface BondingProgressProps {
	pool: PoolWithMetadata
}

export function BondingProgress({ pool }: BondingProgressProps) {
	const progress = typeof pool.bondingCurve === "number" ? pool.bondingCurve : parseFloat(pool.bondingCurve) || 0

	return (
		<div className="relative border-b border-border">
			<div className="p-3 space-y-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						{/* Indicator */}
						<div className="relative flex items-center justify-center">
							<div className="absolute w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
							<div className="w-2 h-2 rounded-full bg-blue-400" />
						</div>

						<div className="flex flex-col">
							<p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
								Bonding Curve Progress
							</p>
							<div className="flex items-center gap-2">
								<span className="font-mono text-sm font-bold text-foreground">
									{Math.round(progress)}% Complete
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Progress Bar */}
				<div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/20 border border-border/50">
					<div
						className="absolute left-0 top-0 h-full transition-all duration-500 ease-out bg-gradient-to-r from-blue-400/60 to-blue-400"
						style={{ width: `${Math.min(progress, 100)}%` }}
					/>
				</div>
			</div>
		</div>
	)
}