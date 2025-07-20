"use client"

import { useMemo } from "react"
import { TokenCard } from "./token-card"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { PoolWithMetadata } from "@/types/pool"
import { Skull, RefreshCw } from "lucide-react"

interface TokenColumnsProps {
	pools: PoolWithMetadata[]
	isRefreshing?: boolean
}

export function TokenColumns({ pools, isRefreshing }: TokenColumnsProps) {
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

		// sort by creation date (newest first for new pools)
		categorized.new.sort((a, b) => {
			const dateA = typeof a.createdAt === "string" ? parseInt(a.createdAt) : a.createdAt || 0
			const dateB = typeof b.createdAt === "string" ? parseInt(b.createdAt) : b.createdAt || 0
			return dateB - dateA
		})

		// sort by bonding progress (highest first for near max)
		categorized.nearMax.sort((a, b) => {
			const progressA = parseFloat(a.bondingCurve)
			const progressB = parseFloat(b.bondingCurve)
			return progressB - progressA
		})

		// sort migrated by creation date (newest first)
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

	const EmptyState = ({ message }: { message: string }) => (
		<div className="flex flex-col items-center justify-center py-8 px-4">
			<Skull className="w-8 h-8 text-foreground/20 mb-2" />
			<p className="font-mono text-xs uppercase text-muted-foreground text-center">{message}</p>
		</div>
	)

	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full max-h-full">
			{/* New Tokens Column */}
			<div className="flex flex-col h-full max-h-full">
				<div className="border-2 bg-background/50 backdrop-blur-sm rounded-lg p-2 mb-2">
					<div className="flex items-center justify-between">
						<div>
							<h2 className="font-mono text-sm uppercase tracking-wider text-foreground/80">NEW::TOKENS</h2>
							<p className="font-mono text-xs uppercase text-muted-foreground">RECENTLY::CREATED</p>
						</div>
						{isRefreshing && <RefreshCw className="w-3 h-3 text-muted-foreground animate-spin" />}
					</div>
				</div>
				<div className="flex-1 border-2 bg-background/50 backdrop-blur-sm rounded-lg overflow-hidden">
					<ScrollArea className="h-full">
						<div>
							{newPools.length > 0 ? (
								newPools.map((pool) => <TokenCard key={pool.poolId} pool={pool} />)
							) : (
								<EmptyState message="NO::NEW::TOKENS::AVAILABLE" />
							)}
						</div>
					</ScrollArea>
				</div>
			</div>

			{/* Near Max Bonding Column */}
			<div className="flex flex-col h-full max-h-full">
				<div className="border-2 bg-background/50 backdrop-blur-sm rounded-lg p-2 mb-2">
					<h2 className="font-mono text-sm uppercase tracking-wider text-foreground/80">NEAR::GRADUATION</h2>
					<p className="font-mono text-xs uppercase text-muted-foreground">75%::OR::HIGHER</p>
				</div>
				<div className="flex-1 border-2 bg-background/50 backdrop-blur-sm rounded-lg overflow-hidden">
					<ScrollArea className="h-full">
						<div>
							{nearMaxBonding.length > 0 ? (
								nearMaxBonding.map((pool) => <TokenCard key={pool.poolId} pool={pool} />)
							) : (
								<EmptyState message="NO::TOKENS::NEAR::GRADUATION" />
							)}
						</div>
					</ScrollArea>
				</div>
			</div>

			{/* Migrated Pools Column */}
			<div className="flex flex-col h-full max-h-full">
				<div className="border-2 bg-background/50 backdrop-blur-sm rounded-lg p-2 mb-2">
					<h2 className="font-mono text-sm uppercase tracking-wider text-foreground/80">MIGRATED::TOKENS</h2>
					<p className="font-mono text-xs uppercase text-muted-foreground">SUCCESSFULLY::MIGRATED</p>
				</div>
				<div className="flex-1 border-2 bg-background/50 backdrop-blur-sm rounded-lg overflow-hidden">
					<ScrollArea className="h-full">
						<div>
							{migratedPools.length > 0 ? (
								migratedPools.map((pool) => <TokenCard key={pool.poolId} pool={pool} />)
							) : (
								<EmptyState message="NO::MIGRATED::TOKENS::YET" />
							)}
						</div>
					</ScrollArea>
				</div>
			</div>
		</div>
	)
}
