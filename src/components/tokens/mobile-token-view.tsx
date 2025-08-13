"use client"

import { useMemo, useState } from "react"
import { TokenCard } from "./token-card"
import type { PoolWithMetadata } from "@/types/pool"
import { RefreshCw, Pause, Play, Zap, TrendingUp, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { cn } from "@/utils"

interface MobileTokenViewProps {
	pools: PoolWithMetadata[]
	isRefreshing?: boolean
	onPollingChange?: (enabled: boolean) => void
	isPolling?: boolean
}

type TabType = "new" | "nearGraduation" | "graduated"

export function MobileTokenView({ 
	pools, 
	isRefreshing,
	onPollingChange,
	isPolling = true
}: MobileTokenViewProps) {
	const [activeTab, setActiveTab] = useState<TabType>("new")
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

		// Sort new pools by creation date (newest first)
		categorized.new.sort((a, b) => {
			const dateA = typeof a.createdAt === "string" ? parseInt(a.createdAt) : a.createdAt || 0
			const dateB = typeof b.createdAt === "string" ? parseInt(b.createdAt) : b.createdAt || 0
			return dateB - dateA
		})

		// Sort near max by bonding progress (highest first)
		categorized.nearMax.sort((a, b) => {
			const progressA = parseFloat(a.bondingCurve)
			const progressB = parseFloat(b.bondingCurve)
			return progressB - progressA
		})

		// Sort migrated by creation date (newest first)
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

	const handleManualPause = () => {
		const newState = !manualPause
		setManualPause(newState)
		if (onPollingChange) {
			onPollingChange(!newState)
		}
	}

	const currentPools = activeTab === "new" 
		? newPools 
		: activeTab === "nearGraduation" 
			? nearMaxBonding 
			: migratedPools

	const EmptyState = ({ message }: { message: string }) => (
		<div className="text-center py-16">
			<Logo className="w-8 h-8 mx-auto mb-3 text-muted-foreground/40" />
			<p className="font-mono text-xs uppercase tracking-wider text-muted-foreground/60">
				{message}
			</p>
		</div>
	)

	return (
		<div className="h-full flex flex-col">
			{/* Tab Header */}
			<div className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
				<div className="flex items-center justify-between p-2">
					<div className="flex gap-1">
						<Button
							variant={activeTab === "new" ? "default" : "ghost"}
							size="sm"
							onClick={() => setActiveTab("new")}
							className={cn(
								"h-8 px-3 font-mono text-xs uppercase",
								activeTab === "new" 
									? "bg-primary/10 hover:bg-primary/20 text-primary" 
									: ""
							)}
						>
							<Zap className="w-3 h-3 mr-1" />
							New
							{newPools.length > 0 && (
								<span className="ml-1.5 text-[10px] opacity-70">
									({newPools.length})
								</span>
							)}
						</Button>
						<Button
							variant={activeTab === "nearGraduation" ? "default" : "ghost"}
							size="sm"
							onClick={() => setActiveTab("nearGraduation")}
							className={cn(
								"h-8 px-3 font-mono text-xs uppercase",
								activeTab === "nearGraduation" 
									? "bg-green-500/10 hover:bg-green-500/20 text-green-500" 
									: ""
							)}
						>
							<TrendingUp className="w-3 h-3 mr-1" />
							Hot
							{nearMaxBonding.length > 0 && (
								<span className="ml-1.5 text-[10px] opacity-70">
									({nearMaxBonding.length})
								</span>
							)}
						</Button>
						<Button
							variant={activeTab === "graduated" ? "default" : "ghost"}
							size="sm"
							onClick={() => setActiveTab("graduated")}
							className={cn(
								"h-8 px-3 font-mono text-xs uppercase",
								activeTab === "graduated" 
									? "bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500" 
									: ""
							)}
						>
							<Award className="w-3 h-3 mr-1" />
							Grad
							{migratedPools.length > 0 && (
								<span className="ml-1.5 text-[10px] opacity-70">
									({migratedPools.length})
								</span>
							)}
						</Button>
					</div>
					
					{/* Pause/Play button */}
					<Button
						variant="ghost"
						size="icon"
						onClick={handleManualPause}
						className="h-8 w-8"
						title={manualPause ? "Resume updates" : "Pause updates"}
					>
						{manualPause ? (
							<Play className="h-3 w-3" />
						) : isRefreshing ? (
							<RefreshCw className="h-3 w-3 animate-spin" />
						) : (
							<Pause className="h-3 w-3" />
						)}
					</Button>
				</div>
			</div>

			{/* Token List */}
			<div className="flex-1 overflow-y-auto">
				<div className="space-y-1">
					{currentPools.length === 0 ? (
						<EmptyState 
							message={
								activeTab === "new" 
									? "NO::NEW::TOKENS" 
									: activeTab === "nearGraduation"
										? "NO::HOT::TOKENS"
										: "NO::GRADUATED::TOKENS"
							}
						/>
					) : (
						currentPools.map((pool) => (
							<TokenCard key={pool.poolId} pool={pool} />
						))
					)}
				</div>
			</div>
		</div>
	)
}