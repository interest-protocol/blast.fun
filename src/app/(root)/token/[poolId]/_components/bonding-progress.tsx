"use client"

import type { PoolWithMetadata } from "@/types/pool"
import { useQuery } from "@tanstack/react-query"

interface BondingProgressProps {
	pool: PoolWithMetadata
}

interface BondingProgressData {
	poolId: string
	bondingCurve: number | string
	migrated: boolean
	updatedAt: string
}

export function BondingProgress({ pool }: BondingProgressProps) {
	const { data: progressData } = useQuery<BondingProgressData>({
		queryKey: ["bonding-progress", pool.poolId],
		queryFn: async () => {
			const response = await fetch(`/api/tokens/${pool.poolId}/bonding-progress`)
			if (!response.ok) {
				throw new Error("Failed to fetch bonding progress")
			}
			return response.json()
		},
		enabled: !!pool.poolId && !pool.migrated,
		refetchInterval: 3000,
		initialData: {
			poolId: pool.poolId,
			bondingCurve: pool.bondingCurve,
			migrated: pool.migrated,
			updatedAt: new Date().toISOString()
		},
	})

	const progress = typeof progressData.bondingCurve === "number" ? progressData.bondingCurve : parseFloat(progressData.bondingCurve) || 0
	const isComplete = progress >= 100

	return (
		<div className="relative border-b border-border">
			<div className="p-3 space-y-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						{/* Indicator */}
						<div className="relative flex items-center justify-center">
							<div className={`absolute w-2 h-2 rounded-full ${isComplete ? "bg-green-400 animate-ping" : "bg-blue-400 animate-pulse"}`} />
							<div className={`w-2 h-2 rounded-full ${isComplete ? "bg-green-400" : "bg-blue-400"}`} />
						</div>

						<div className="flex flex-col">
							<p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
								Bonding Curve Progress
							</p>
							<div className="flex items-center gap-2">
								<span className="font-mono text-sm font-bold text-foreground">
									{Math.round(progress)}% Complete
								</span>
								{isComplete && (
									<span className="font-mono text-xs text-green-400">
										• Ready
									</span>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Progress Bar */}
				<div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/20 border border-border/50">
					<div
						className={`absolute left-0 top-0 h-full transition-all duration-500 ease-out ${
							isComplete
								? "bg-green-400"
								: "bg-gradient-to-r from-blue-400/60 to-blue-400"
						}`}
						style={{ width: `${Math.min(progress, 100)}%` }}
					/>
				</div>
			</div>
		</div>
	)
}