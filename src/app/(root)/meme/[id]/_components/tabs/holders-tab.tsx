"use client"

import { PoolWithMetadata } from "@/types/pool"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users, ExternalLink, Loader2 } from "lucide-react"
import { formatAmountWithSuffix, formatNumberWithSuffix } from "@/utils/format"
import { cn } from "@/utils"
import { useRef, useEffect, useMemo } from "react"
import { Progress } from "@/components/ui/progress"
import { CopyableAddress } from "@/components/shared/copyable-address"
import { useMarketData } from "@/hooks/use-market-data"
import { useInfiniteHoldersWithPortfolio } from "@/hooks/use-holders-with-portfolio"

interface HoldersTabProps {
	pool: PoolWithMetadata
	className?: string
}

export function HoldersTab({ pool, className }: HoldersTabProps) {
	const scrollRef = useRef<HTMLDivElement>(null)
	const loadMoreRef = useRef<HTMLDivElement>(null)

	const { data: marketData } = useMarketData(pool.coinType)
	const metadata = marketData?.coinMetadata || pool.coinMetadata

	const HOLDERS_PER_PAGE = 10

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		error
	} = useInfiniteHoldersWithPortfolio({
		coinType: pool.coinType,
		limit: HOLDERS_PER_PAGE,
		enabled: !!pool.coinType
	})

	const holders = useMemo(() => {
		if (!data?.pages) return []
		return data.pages.flat()
	}, [data?.pages])

	const coinDecimals = metadata?.decimals || 9

	// infinite scroll observer
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage()
				}
			},
			{ threshold: 0.1 }
		)

		if (loadMoreRef.current) {
			observer.observe(loadMoreRef.current)
		}

		return () => observer.disconnect()
	}, [hasNextPage, isFetchingNextPage, fetchNextPage])


	const formatPnl = (realizedPnl?: number) => {
		if (!realizedPnl || realizedPnl === 0) return <span className="text-muted-foreground">-</span>

		const pnlValue = realizedPnl
		const isPositive = pnlValue >= 0

		return (
			<span className={cn(
				"font-mono text-[11px] sm:text-xs",
				isPositive ? "text-green-400" : "text-destructive"
			)}>
				{isPositive ? "+" : ""}${formatAmountWithSuffix(Math.abs(pnlValue))}
			</span>
		)
	}

	if (isLoading) {
		return (
			<ScrollArea className={cn(className || "h-[500px]")}>
				<div className="p-4">
					<div className="text-center py-16">
						<div className="relative inline-block">
							<Users className="w-16 h-16 mx-auto text-foreground/20 mb-4" />
							<div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full animate-pulse" />
						</div>
						<p className="font-mono text-sm uppercase text-muted-foreground mb-2">
							HOLDERS::LOADING
						</p>
						<p className="font-mono text-xs uppercase text-muted-foreground/60">
							FETCHING_HOLDER_DATA_FOR_{metadata?.symbol || "[TOKEN]"}
						</p>
						<div className="flex items-center justify-center gap-1 mt-4">
							<div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
							<div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150" />
							<div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-300" />
						</div>
					</div>
				</div>
			</ScrollArea>
		)
	}

	if (error) {
		return (
			<div className="p-8 text-center">
				<Users className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
				<p className="font-mono text-sm uppercase text-destructive">ERROR::LOADING::HOLDERS</p>
				<p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">DATA_UNAVAILABLE</p>
			</div>
		)
	}

	return (
		<ScrollArea className={cn(className || "h-[500px]")} ref={scrollRef}>
			<div className="w-full">
				{holders.length === 0 ? (
					<div className="text-center py-12">
						<Users className="w-12 h-12 mx-auto text-foreground/20 mb-4 animate-pulse" />
						<p className="font-mono text-sm uppercase text-muted-foreground">
							NO::HOLDERS::DETECTED
						</p>
						<p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">
							AWAITING_DISTRIBUTION
						</p>
					</div>
				) : (
					<div className="relative">
						<div className="grid grid-cols-12 gap-2 px-2 sm:px-4 py-2 border-b border-border/50 text-[11px] sm:text-xs font-mono uppercase text-muted-foreground sticky top-0 bg-background/95 backdrop-blur-sm z-10 select-none">
							<div className="col-span-1">#</div>
							<div className="col-span-4 sm:col-span-3">Wallet</div>
							<div className="col-span-2 text-right">Bought</div>
							<div className="col-span-2 text-right">Sold</div>
							<div className="col-span-1 sm:col-span-2 text-right">PNL</div>
							<div className="col-span-2 text-right">Remaining</div>
						</div>

						{holders.map((holder) => {
							const stats = holder.marketStats
							const isDataLoading = !stats && holder.rank <= 10

							return (
								<div
									key={holder.user}
									className="relative group hover:bg-muted/5 transition-all duration-200"
								>
									<div className="relative grid grid-cols-12 gap-2 px-2 sm:px-4 py-1.5 sm:py-2 items-center border-b border-border/30">
										{/* Rank */}
										<div className="col-span-1">
											<span className={cn(
												"font-mono text-[11px] sm:text-xs",
												holder.rank <= 3 ? "text-primary font-semibold" : "text-muted-foreground"
											)}>
												{holder.rank}
											</span>
										</div>

										{/* Wallet */}
										<div className="col-span-4 sm:col-span-3 flex items-center gap-1">
											<CopyableAddress
												address={holder.user}
												className="text-[11px] sm:text-xs hover:text-primary"
											/>
											<a
												href={`https://suivision.xyz/account/${holder.user}`}
												target="_blank"
												rel="noopener noreferrer"
												className="p-0.5 text-muted-foreground hover:text-foreground transition-all duration-300 opacity-0 group-hover:opacity-100"
											>
												<ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
											</a>
										</div>

										{/* Bought */}
										<div className="col-span-2 text-right">
											{isDataLoading ? (
												<div className="space-y-1">
													<div className="h-3 w-12 bg-muted/30 animate-pulse rounded ml-auto" />
													<div className="h-2.5 w-16 bg-muted/20 animate-pulse rounded ml-auto" />
												</div>
											) : (
												<div className="space-y-0.5">
													<div className="font-mono text-[11px] sm:text-xs text-green-400">
														${formatNumberWithSuffix(stats?.usdBought || 0)}
													</div>
													<div className="font-mono text-[10px] sm:text-[11px] text-muted-foreground/60">
														{formatNumberWithSuffix((stats?.amountBought || 0) / Math.pow(10, coinDecimals))} / {stats?.buyTrades || 0}
													</div>
												</div>
											)}
										</div>

										{/* Sold */}
										<div className="col-span-2 text-right">
											{isDataLoading ? (
												<div className="space-y-1">
													<div className="h-3 w-12 bg-muted/30 animate-pulse rounded ml-auto" />
													<div className="h-2.5 w-16 bg-muted/20 animate-pulse rounded ml-auto" />
												</div>
											) : (
												<div className="space-y-0.5">
													<div className="font-mono text-[11px] sm:text-xs text-destructive">
														${formatNumberWithSuffix(stats?.usdSold || 0)}
													</div>
													<div className="font-mono text-[10px] sm:text-[11px] text-muted-foreground/60">
														{formatNumberWithSuffix((stats?.amountSold || 0) / Math.pow(10, coinDecimals))} / {stats?.sellTrades || 0}
													</div>
												</div>
											)}
										</div>

										{/* PnL */}
										<div className="col-span-1 sm:col-span-2 text-right">
											{isDataLoading ? (
												<div className="h-3 w-10 bg-muted/30 animate-pulse rounded ml-auto" />
											) : (
												formatPnl(holder.realizedPnl || stats?.pnl)
											)}
										</div>

										{/* Remaining (Holding + %) */}
										<div className="col-span-2 text-right">
											<div className="space-y-1">
												<div className="flex items-center justify-end gap-2">
													<span className="font-mono text-[11px] sm:text-xs text-foreground/80">
														{formatAmountWithSuffix(stats?.currentHolding || holder.balance || 0)}
													</span>
													<span className={cn(
														"px-1.5 py-0 h-4 text-[10px] font-mono rounded-md border inline-flex items-center",
														holder.percentage >= 5
															? "border-primary/50 bg-primary/10 text-primary"
															: holder.percentage >= 1
																? "border-blue-400/50 bg-blue-400/10 text-blue-400"
																: "border-muted-foreground/30 bg-muted/50 text-muted-foreground"
													)}>
														{holder.percentage.toFixed(1)}%
													</span>
												</div>
												<div className="flex justify-end mt-1">
													<Progress
														value={holder.percentage}
														className="h-1 w-16 sm:w-20 bg-muted/50"
													/>
												</div>
											</div>
										</div>
									</div>
								</div>
							)
						})}

						{/* Load More */}
						{hasNextPage && (
							<div ref={loadMoreRef} className="py-4 text-center">
								{isFetchingNextPage ? (
									<div className="flex items-center justify-center gap-2 font-mono text-xs text-muted-foreground">
										<Loader2 className="h-3 w-3 animate-spin" />
										LOADING::MORE::HOLDERS...
									</div>
								) : (
									<div className="font-mono text-xs text-muted-foreground">
										SCROLL::FOR::MORE
									</div>
								)}
							</div>
						)}
					</div>
				)}
			</div>
		</ScrollArea>
	)
}