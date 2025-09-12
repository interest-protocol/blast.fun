"use client"

import { useState, useMemo, useEffect } from "react"
import { useLeaderboard, TimeRange, SortBy } from "@/hooks/use-leaderboard"
import { Trophy, Medal, ArrowUp, ArrowDown } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/utils/index"
import { formatAddress } from "@mysten/sui/utils"
import { formatPrice } from "@/lib/format"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Logo } from "@/components/ui/logo"
import { Skeleton } from "@/components/ui/skeleton"
import { useSuiNSNames } from "@/hooks/use-suins"

export default function LeaderboardPage() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [timeRange, setTimeRange] = useState<TimeRange>('24h')
	const [initialSort, setInitialSort] = useState<SortBy>('volume')
	
	// @dev: Read sort and range from URL on mount
	useEffect(() => {
		const sortParam = searchParams.get('sort')
		const rangeParam = searchParams.get('range')
		
		if (sortParam === 'volume' || sortParam === 'trades') {
			setInitialSort(sortParam as SortBy)
		}
		
		if (rangeParam === '24h' || rangeParam === '7d' || rangeParam === '14d' || rangeParam === 'all') {
			setTimeRange(rangeParam as TimeRange)
		}
	}, [])
	
	const { data, loading, error, sortBy, sortOrder, handleSort: baseHandleSort } = useLeaderboard({ 
		timeRange,
		initialSort 
	})
	
	// @dev: Wrap handleSort to update URL
	const handleSort = (field: SortBy) => {
		baseHandleSort(field)
		const params = new URLSearchParams(searchParams.toString())
		params.set('sort', field)
		router.push(`/leaderboard?${params.toString()}`)
	}
	
	// @dev: Handle time range change with URL update
	const handleTimeRangeChange = (range: TimeRange) => {
		setTimeRange(range)
		const params = new URLSearchParams(searchParams.toString())
		params.set('range', range)
		router.push(`/leaderboard?${params.toString()}`)
	}

	const traderAddresses = useMemo(() => {
		return data.map(entry => entry.user) || []
	}, [data])

	const { data: suinsNames } = useSuiNSNames(traderAddresses)

	const getRankDisplay = (rank: number) => {
		if (rank === 1) return <Trophy className="h-4 w-4 text-yellow-500" />
		if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" />
		if (rank === 3) return <Medal className="h-4 w-4 text-amber-600" />
		return <span className="text-xs font-mono text-muted-foreground">#{rank}</span>
	}

	return (
		<div className="container max-w-7xl mx-auto h-full flex flex-col">
			{/* Controls Section */}
			<div className="flex justify-start mb-3">
				<div className="p-0.5 bg-card/50 backdrop-blur-sm border border-border/50 rounded-md flex items-center">
					{(['24h', '7d', '14d', 'all'] as const).map((range) => (
						<button
							key={range}
							onClick={() => handleTimeRangeChange(range)}
							disabled={loading}
							className={cn(
								"px-3 py-1 text-xs font-mono uppercase transition-all rounded",
								"disabled:opacity-50 disabled:cursor-not-allowed",
								timeRange === range
									? "bg-destructive/80 backdrop-blur-sm text-destructive-foreground"
									: "text-muted-foreground hover:text-foreground hover:bg-muted/50"
							)}
							title={
								range === '14d' ? 'Current reward cycle' : 
								range === 'all' ? 'All time since Sep 1' : 
								undefined
							}
						>
							{range === '24h' && '24H'}
							{range === '7d' && '7D'}
							{range === '14d' && 'CYCLE'}
							{range === 'all' && 'ALL'}
						</button>
					))}
				</div>
			</div>

			{/* Leaderboard Content */}
			<div className="flex-1 bg-card/50 border border-border/50 rounded-lg overflow-hidden min-h-0">
				{loading ? (
					<ScrollArea className="h-full">
						<div className="w-full">
							<div className="relative">
								<div className="grid grid-cols-12 py-2 border-b border-border/50 text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground sticky top-0 bg-card/95 backdrop-blur-sm z-10 select-none">
									<div className="col-span-1"></div>
									<div className="col-span-5 pl-2">
										<Skeleton className="h-3 w-16" />
									</div>
									<div className="col-span-3 flex justify-end">
										<Skeleton className="h-3 w-16" />
									</div>
									<div className="col-span-3 flex justify-end pr-4">
										<Skeleton className="h-3 w-16" />
									</div>
								</div>
								
								{/* Rows Skeleton */}
								{Array.from({ length: 15 }).map((_, i) => (
									<div key={i} className="relative group">
										<div className="relative grid grid-cols-12 py-2 sm:py-3 items-center border-b border-border/30">
											<div className="col-span-1 flex justify-center">
												<Skeleton className="h-4 w-4 rounded" />
											</div>
											<div className="col-span-5 pl-2">
												<Skeleton className="h-3 w-24" />
											</div>
											<div className="col-span-3 flex justify-end">
												<Skeleton className="h-3 w-16" />
											</div>
											<div className="col-span-3 flex justify-end pr-4">
												<Skeleton className="h-3 w-12" />
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</ScrollArea>
				) : error ? (
					<div className="p-8 text-center">
						<Logo className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
						<p className="font-mono text-sm uppercase text-destructive">ERROR::LOADING::LEADERBOARD</p>
						<p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">CHECK_CONNECTION</p>
					</div>
				) : data.length === 0 ? (
					<div className="text-center py-12">
						<Trophy className="w-12 h-12 mx-auto text-foreground/20 mb-4 animate-pulse" />
						<p className="font-mono text-sm uppercase text-muted-foreground">
							NO::TRADING::DATA
						</p>
						<p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">
							BE_THE_FIRST_TO_TRADE
						</p>
					</div>
				) : (
					<ScrollArea className="h-full">
						<div className="w-full">
							<div className="relative">
								{/* Header - Sticky like holders tab */}
								<div className="grid grid-cols-12 py-2 border-b border-border/50 text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground sticky top-0 bg-card/95 backdrop-blur-sm z-10 select-none">
									<div className="col-span-1 text-center"></div>
									<div className="col-span-5 pl-2">TRADER</div>
									<div 
										className="col-span-3 text-right cursor-pointer hover:text-foreground transition-colors flex justify-end items-center gap-1"
										onClick={() => handleSort('volume')}
									>
										VOLUME
										{sortBy === 'volume' && <ArrowDown className="h-3 w-3" />}
									</div>
									<div 
										className="col-span-3 text-right pr-4 cursor-pointer hover:text-foreground transition-colors flex justify-end items-center gap-1"
										onClick={() => handleSort('trades')}
									>
										TRADES
										{sortBy === 'trades' && <ArrowDown className="h-3 w-3" />}
									</div>
								</div>

								{/* Table Body */}
								{data.map((entry, index) => {
									const rank = entry.rank || index + 1
									const icon = getRankDisplay(rank)
									const suinsName = suinsNames?.[entry.user]
									
									// @dev: Ensure we have a user address
									if (!entry.user) {
										console.warn('Entry missing user:', entry)
										return null
									}

									return (
										<div
											key={`${entry.user}-${index}`}
											className="relative group hover:bg-muted/5 transition-all duration-200"
										>
											<div className="relative grid grid-cols-12 py-2 sm:py-3 items-center border-b border-border/30">
												{/* Rank */}
												<div className="col-span-1 flex justify-center">
													{icon}
												</div>

												{/* Trader Address */}
												<div className="col-span-5 flex items-center gap-2 pl-2">
													<div className="flex-1">
														{suinsName ? (
															<a
																href={`https://suivision.xyz/account/${entry.user}`}
																target="_blank"
																rel="noopener noreferrer"
																className="flex flex-col hover:opacity-80 transition-opacity"
															>
																<span className="font-mono text-[10px] sm:text-xs text-foreground">
																	{suinsName}
																</span>
																<span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground">
																	{formatAddress(entry.user)}
																</span>
															</a>
														) : (
															<a
																href={`https://suivision.xyz/account/${entry.user}`}
																target="_blank"
																rel="noopener noreferrer"
																className="font-mono text-[10px] sm:text-xs text-muted-foreground hover:text-primary transition-colors"
															>
																<span className="sm:hidden">
																	{formatAddress(entry.user).slice(0, 6) + '...'}
																</span>
																<span className="hidden sm:inline">
																	{formatAddress(entry.user)}
																</span>
															</a>
														)}
													</div>
												</div>

												{/* Volume */}
												<div className="col-span-3 text-right">
													<span className="font-mono text-[10px] sm:text-xs text-foreground/80">
														{formatPrice(entry.totalVolume || 0)}
													</span>
												</div>

												{/* Trades */}
												<div className="col-span-3 text-right pr-4">
													<span className="font-mono text-[10px] sm:text-xs text-foreground/60">
														{(entry.tradeCount || 0).toLocaleString()}
													</span>
												</div>
											</div>
										</div>
									)
								})}
							</div>
						</div>
					</ScrollArea>
				)}
			</div>
		</div>
	)
}