"use client"

import { useState } from "react"
import { Coins, Loader2, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/context/app.context"
import { useMigrationPositions } from "@/hooks/use-migration-positions"
import type { PoolWithMetadata } from "@/types/pool"
import { formatNumberWithSuffix } from "@/utils/format"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface MigrationFeesProps {
	pool: PoolWithMetadata
}

export function MigrationFees({ pool }: MigrationFeesProps) {
	const { isConnected } = useApp()
	const {
		positions,
		isLoading,
		error,
		collectFees,
		refetch
	} = useMigrationPositions()

	const [collectingPositionId, setCollectingPositionId] = useState<string | null>(null)

	const poolPositions = positions.filter(p => {
		return p.memeCoinType === pool.coinType ||
			p.blueFinPoolId === pool.poolId
	})

	const handleCollectFees = async (positionId: string) => {
		setCollectingPositionId(positionId)
		try {
			await collectFees(positionId)
		} finally {
			setCollectingPositionId(null)
		}
	}

	if (!pool.migrated) {
		return null
	}

	if (!isConnected) {
		return (
			<div className="border-b border-border">
				<div className="p-3">
					<div className="flex items-center gap-2">
						<div className="w-2 h-2 bg-muted-foreground rounded-full" />
						<div className="flex flex-col">
							<p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
								Migration Fees
							</p>
							<span className="font-mono text-sm text-muted-foreground">
								Connect wallet to check positions
							</span>
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (isLoading) {
		return (
			<div className="border-b border-border">
				<div className="p-3">
					<div className="flex items-center gap-2">
						<Loader2 className="w-4 h-4 animate-spin text-primary" />
						<div className="flex flex-col">
							<p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
								Migration Fees
							</p>
							<span className="font-mono text-sm text-foreground">
								Checking positions...
							</span>
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="border-b border-border">
				<div className="p-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<AlertCircle className="w-4 h-4 text-destructive" />
							<div className="flex flex-col">
								<p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
									Migration Fees
								</p>
								<span className="font-mono text-sm text-destructive">
									{error}
								</span>
							</div>
						</div>
						<Button
							variant="ghost"
							size="sm"
							onClick={refetch}
							className="h-7 px-2"
						>
							<RefreshCw className="h-3.5 w-3.5" />
						</Button>
					</div>
				</div>
			</div>
		)
	}

	if (poolPositions.length === 0) {
		return null
	}

	return (
		<div className="relative border-b border-border">
			<div className="p-3 space-y-3">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						{/* Status Indicator */}
						<div className="relative flex items-center justify-center">
							<div className="absolute w-2 h-2 bg-green-400 rounded-full animate-ping" />
							<div className="w-2 h-2 bg-green-400 rounded-full" />
						</div>

						<div className="flex flex-col">
							<p className="font-mono font-medium text-[10px] uppercase tracking-wider text-muted-foreground">
								Migration Fees Available
							</p>
							<span className="font-mono text-sm font-bold text-foreground">
								{poolPositions.length} Position{poolPositions.length !== 1 ? "s" : ""}
							</span>
						</div>
					</div>
				</div>

				{/* Positions List */}
				<div className="space-y-2">
					{poolPositions.map((position) => (
						<div
							key={position.id}
							className="p-2.5 border rounded-lg transition-all border-green-500/20 bg-green-500/5"
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<CheckCircle2 className="h-4 w-4 text-green-500" />
									<p className="font-mono text-xs text-foreground">
										Position #{position.id.slice(-6)}
									</p>
								</div>

								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleCollectFees(position.id)}
											disabled={collectingPositionId === position.id}
											className="font-mono text-xs uppercase !border-green-400/50 !bg-green-400/10 text-green-400 hover:text-green-400/80"
										>
											{collectingPositionId === position.id ? (
												<Loader2 className="h-3.5 w-3.5 animate-spin" />
											) : (
												<>
													<Coins className="h-3.5 w-3.5 mr-1" />
													COLLECT
												</>
											)}
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										<p className="text-xs">Collect accumulated fees from this position</p>
									</TooltipContent>
								</Tooltip>
							</div>
						</div>
					))}
				</div>

				<div className="pt-2 border-t border-border">
					<p className="font-mono text-[10px] uppercase text-muted-foreground">
						Collect your accumulated trading fees from migration
					</p>
				</div>
			</div>
		</div>
	)
}