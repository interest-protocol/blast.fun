"use client"

import { useMemo, useState, useEffect } from "react"
import { TokenCard } from "./token-card"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { PoolWithMetadata } from "@/types/pool"
import { RefreshCw, Pause, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"

interface TokenColumnsProps {
	pools: PoolWithMetadata[]
	isRefreshing?: boolean
	onPollingChange?: (enabled: boolean) => void
	isPolling?: boolean
}

export function TokenColumns({ 
	pools, 
	isRefreshing,
	onPollingChange,
	isPolling = true
}: TokenColumnsProps) {
	const [manualPause, setManualPause] = useState(false)

	const { newPools, nearMaxBonding, migratedPools } = useMemo(() => {
		const categorized = {
			new: [] as PoolWithMetadata[],
			nearMax: [] as PoolWithMetadata[],
			migrated: [] as PoolWithMetadata[],
		}

		pools.forEach((pool) => {
			const bondingProgress = parseFloat(pool.bondingCurve)

			if (pool.migrated) {
				categorized.migrated.push(pool)
			} else if (bondingProgress >= 75) {
				categorized.nearMax.push(pool)
			} else {
				categorized.new.push(pool)
			}
		})

		categorized.new.sort((a, b) => {
			const dateA = typeof a.createdAt === "string" ? parseInt(a.createdAt) : a.createdAt || 0
			const dateB = typeof b.createdAt === "string" ? parseInt(b.createdAt) : b.createdAt || 0
			return dateB - dateA
		})

		categorized.nearMax.sort((a, b) => {
			const progressA = parseFloat(a.bondingCurve)
			const progressB = parseFloat(b.bondingCurve)
			return progressB - progressA
		})

		categorized.migrated.sort((a, b) => {
			const dateA = typeof a.createdAt === "string" ? parseInt(a.createdAt) : a.createdAt || 0
			const dateB = typeof b.createdAt === "string" ? parseInt(b.createdAt) : b.createdAt || 0
			return dateB - dateA
		})

		return {
			newPools: categorized.new,
			nearMaxBonding: categorized.nearMax,
			migratedPools: categorized.migrated,
		}
	}, [pools])

	useEffect(() => {
		if (onPollingChange) {
			onPollingChange(!manualPause)
		}
	}, [manualPause, onPollingChange])

	const handleManualPause = () => {
		setManualPause(!manualPause)
	}

	const effectivePaused = manualPause

	const EmptyState = ({ message }: { message: string }) => (
		<div className="text-center py-16">
			<Logo className="w-8 h-8 mx-auto mb-3 text-muted-foreground/40" />
			<p className="font-mono text-xs uppercase tracking-wider text-muted-foreground/60">
				{message}
			</p>
		</div>
	)

	return (
		<div className="h-full w-full grid grid-cols-1 lg:grid-cols-3 gap-4">
			<div className="border border-border/50 rounded-xl flex flex-col min-h-0 overflow-hidden">
				<div className="px-4 py-3 border-b border-border/50 flex items-center justify-between flex-shrink-0">
					<h2 className="font-mono text-xs uppercase tracking-wider text-foreground/80">
						TERMINAL::FEED
					</h2>
					<div className="flex items-center gap-2">
						{isRefreshing && !effectivePaused && (
							<RefreshCw className="h-3 w-3 text-primary/60 animate-spin" />
						)}
						<Button
							variant="ghost"
							size="sm"
							className="h-6 w-6 p-0"
							onClick={handleManualPause}
						>
							{manualPause ? (
								<Play className="h-3 w-3 text-muted-foreground" />
							) : (
								<Pause className="h-3 w-3 text-muted-foreground" />
							)}
						</Button>
					</div>
				</div>
				<ScrollArea className="flex-1 overflow-hidden">
					<div>
						{newPools.length > 0 ? (
							<div>
								{newPools.map((pool, index) => (
									<div key={pool.poolId}>
										<TokenCard pool={pool} />
										{index < newPools.length - 1 && (
											<div className="border-b border-border/30" />
										)}
									</div>
								))}
							</div>
						) : (
							<EmptyState message="NO::NEW::TOKENS" />
						)}
					</div>
				</ScrollArea>
			</div>

			<div className="border border-border/50 rounded-xl flex flex-col min-h-0 overflow-hidden">
				<div className="px-4 py-3 border-b border-border/50 flex-shrink-0">
					<h2 className="font-mono text-xs uppercase tracking-wider text-foreground/80">
						GRADUATING::SOON
					</h2>
				</div>
				<ScrollArea className="flex-1 overflow-hidden">
					<div>
						{nearMaxBonding.length > 0 ? (
							<div>
								{nearMaxBonding.map((pool, index) => (
									<div key={pool.poolId}>
										<TokenCard pool={pool} />
										{index < nearMaxBonding.length - 1 && (
											<div className="border-b border-border/30" />
										)}
									</div>
								))}
							</div>
						) : (
							<EmptyState message="NO::TOKENS::GRADUATING" />
						)}
					</div>
				</ScrollArea>
			</div>

			<div className="border border-border/50 rounded-xl flex flex-col min-h-0 overflow-hidden">
				<div className="px-4 py-3 border-b border-border/50 flex-shrink-0">
					<h2 className="font-mono text-xs uppercase tracking-wider text-foreground/80">
						GRADUATED::COMPLETE
					</h2>
				</div>
				<ScrollArea className="flex-1 overflow-hidden">
					<div>
						{migratedPools.length > 0 ? (
							<div>
								{migratedPools.map((pool, index) => (
									<div key={pool.poolId}>
										<TokenCard pool={pool} />
										{index < migratedPools.length - 1 && (
											<div className="border-b border-border/30" />
										)}
									</div>
								))}
							</div>
						) : (
							<EmptyState message="NO::GRADUATED::TOKENS" />
						)}
					</div>
				</ScrollArea>
			</div>
		</div>
	)
}