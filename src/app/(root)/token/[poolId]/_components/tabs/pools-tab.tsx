"use client"

import { PoolWithMetadata } from "@/types/pool"
import { Droplets, ExternalLink, TrendingUp, TrendingDown } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useQuery } from "@tanstack/react-query"
import { cn } from "@/utils"
import { Logo } from "@/components/ui/logo"
import { Skeleton } from "@/components/ui/skeleton"
import { formatAmountWithSuffix } from "@/utils/format"

interface PoolsTabProps {
	pool: PoolWithMetadata
	className?: string
}

interface DexPool {
	dex: string
	link: string
	poolId: string
	balance: string
	price: string
	coinList: string[]
	tvl: string
	volume24H: string
	volume24HChange: string
	apr: string
}

interface PoolsResponse {
	pools: DexPool[]
	total: number
	timestamp: number
}

export function PoolsTab({ pool, className }: PoolsTabProps) {
	const { data, isLoading, error } = useQuery<PoolsResponse>({
		queryKey: ["pools", pool.coinType],
		queryFn: async () => {
			const response = await fetch(`/api/coin/pools/${encodeURIComponent(pool.coinType)}`)
			if (!response.ok) {
				throw new Error("Failed to fetch pools")
			}
			return response.json()
		},
		enabled: !!pool.coinType,
		refetchInterval: 15000, // @dev: Refetch every 15 seconds (matches edge cache)
		staleTime: 10000, // @dev: Consider data stale after 10 seconds
	})

	const formatTVL = (tvl: string) => {
		const value = parseFloat(tvl.replace(/,/g, ""))
		if (value < 1000) return `$${value.toFixed(2)}`
		return `$${formatAmountWithSuffix(value)}`
	}

	const formatVolume = (volume: string) => {
		const value = parseFloat(volume.replace(/,/g, ""))
		if (value < 1000) return `$${value.toFixed(2)}`
		return `$${formatAmountWithSuffix(value)}`
	}

	const formatAPR = (apr: string) => {
		if (!apr || apr === "") return "N/A"
		const value = parseFloat(apr)
		if (value === 0) return "0%"
		if (value < 1) return `${value.toFixed(2)}%`
		if (value < 100) return `${value.toFixed(1)}%`
		return `${Math.round(value)}%`
	}

	if (isLoading) {
		return (
			<div className="p-4 space-y-3">
				{Array.from({ length: 10 }).map((_, i) => (
					<div key={i} className="flex items-center justify-between py-3 border-b border-border/30">
						<div className="flex items-center gap-3">
							<Skeleton className="w-16 h-6" />
							<Skeleton className="h-4 w-32" />
						</div>
						<div className="flex gap-4">
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-4 w-16" />
						</div>
					</div>
				))}
			</div>
		)
	}

	if (error) {
		return (
			<div className="p-8 text-center">
				<Logo className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
				<p className="font-mono text-sm uppercase text-destructive">ERROR::LOADING::POOLS</p>
				<p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">CHECK_CONNECTION</p>
			</div>
		)
	}

	if (!data?.pools || data.pools.length === 0) {
		return (
			<div className="text-center py-12">
				<Droplets className="w-12 h-12 mx-auto text-foreground/20 mb-4 animate-pulse" />
				<p className="font-mono text-sm uppercase text-muted-foreground">
					NO::POOLS::FOUND
				</p>
				<p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">
					LIQUIDITY_NOT_AVAILABLE
				</p>
			</div>
		)
	}

	// @dev: Calculate max TVL for visual representation
	const maxTVL = Math.max(...data.pools.map(p => parseFloat(p.tvl.replace(/,/g, ""))), 1)

	return (
		<ScrollArea className={cn(className || "h-[500px]")}>
			<div className="w-full">
				<div className="relative">
					{/* Header */}
					<div className="grid grid-cols-12 gap-2 px-2 sm:px-4 py-2 border-b border-border/50 text-[10px] sm:text-xs font-mono uppercase text-muted-foreground sticky top-0 bg-background/95 backdrop-blur-sm z-10 select-none">
						<div className="col-span-2">DEX</div>
						<div className="col-span-3 text-right">TVL</div>
						<div className="col-span-3 text-right">24H Volume</div>
						<div className="col-span-2 text-right">24H %</div>
						<div className="col-span-2 text-right">APR</div>
					</div>

					{/* Pools List */}
					{data.pools.map((pool, index) => {
						const volumeChange = parseFloat(pool.volume24HChange)
						const tvlValue = parseFloat(pool.tvl.replace(/,/g, ""))
						const tvlPercentage = (tvlValue / maxTVL) * 100

						return (
							<div
								key={pool.poolId}
								className="relative group hover:bg-muted/5 transition-all duration-200"
							>
								{/* Background gradient for TVL */}
								<div
									className="absolute inset-0 opacity-5 transition-all duration-500 bg-primary"
									style={{ width: `${tvlPercentage}%` }}
								/>

								<div className="relative grid grid-cols-12 gap-2 px-2 sm:px-4 py-2 sm:py-3 items-center border-b border-border/30">
									{/* DEX */}
									<div className="col-span-2">
										<a
											href={pool.link}
											target="_blank"
											rel="noopener noreferrer"
											className="font-mono text-[10px] sm:text-xs text-primary hover:underline uppercase flex items-center gap-1"
										>
											{pool.dex}
											<ExternalLink className="h-2.5 w-2.5 opacity-50" />
										</a>
									</div>

									{/* TVL */}
									<div className="col-span-3 text-right">
										<span className="font-mono text-[10px] sm:text-xs text-foreground">
											{formatTVL(pool.tvl)}
										</span>
									</div>

									{/* 24H Volume */}
									<div className="col-span-3 text-right">
										<span className="font-mono text-[10px] sm:text-xs text-foreground/80">
											{formatVolume(pool.volume24H)}
										</span>
									</div>

									{/* 24H Change */}
									<div className="col-span-2 text-right">
										<div className={cn(
											"flex items-center justify-end gap-0.5 font-mono text-[10px] sm:text-xs",
											volumeChange > 0 ? "text-green-500" : volumeChange < 0 ? "text-red-500" : "text-muted-foreground"
										)}>
											{volumeChange > 0 ? (
												<TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
											) : volumeChange < 0 ? (
												<TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
											) : null}
											<span>{Math.abs(volumeChange).toFixed(1)}%</span>
										</div>
									</div>

									{/* APR */}
									<div className="col-span-2 text-right">
										<span className={cn(
											"font-mono text-[10px] sm:text-xs font-bold",
											parseFloat(pool.apr) > 100 ? "text-green-500" :
											parseFloat(pool.apr) > 50 ? "text-yellow-500" :
											"text-foreground/60"
										)}>
											{formatAPR(pool.apr)}
										</span>
									</div>
								</div>
							</div>
						)
					})}

					{/* Footer with total pools */}
					<div className="py-4 text-center border-t border-border/30">
						<p className="font-mono text-xs text-muted-foreground">
							TOTAL_POOLS: {data.total}
						</p>
					</div>
				</div>
			</div>
		</ScrollArea>
	)
}