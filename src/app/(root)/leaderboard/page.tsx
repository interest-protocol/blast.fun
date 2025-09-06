"use client"

import { formatAddress } from "@mysten/sui/utils"
import { ArrowDown, Medal, Trophy } from "lucide-react"
import { useMemo, useState } from "react"
import { Logo } from "@/components/ui/logo"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { TimeRange, useLeaderboard } from "@/hooks/use-leaderboard"
import { useSuiNSNames } from "@/hooks/use-suins"
import { formatPrice } from "@/lib/format"
import { cn } from "@/utils/index"

export default function LeaderboardPage() {
	const [timeRange, setTimeRange] = useState<TimeRange>("1d")
	const { data, loading, error, sortBy, sortOrder, handleSort } = useLeaderboard({ timeRange })

	const traderAddresses = useMemo(() => {
		return data.map((entry) => entry.user) || []
	}, [data])

	const { data: suinsNames } = useSuiNSNames(traderAddresses)

	const getRankDisplay = (rank: number) => {
		if (rank === 1) return <Trophy className="h-4 w-4 text-yellow-500" />
		if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" />
		if (rank === 3) return <Medal className="h-4 w-4 text-amber-600" />
		return <span className="font-mono text-muted-foreground text-xs">#{rank}</span>
	}

	return (
		<div className="container mx-auto flex h-full max-w-7xl flex-col">
			{/* Controls Section */}
			<div className="mb-3 flex justify-start">
				<div className="flex items-center rounded-md border border-border/50 bg-card/50 p-0.5 backdrop-blur-sm">
					{(["1d", "1w", "1m"] as const).map((range) => (
						<button
							key={range}
							onClick={() => setTimeRange(range)}
							disabled={loading || range !== "1d"}
							className={cn(
								"rounded px-3 py-1 font-mono text-xs uppercase transition-all",
								"disabled:cursor-not-allowed disabled:opacity-50",
								timeRange === range
									? "bg-destructive/80 text-destructive-foreground backdrop-blur-sm"
									: "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
							)}
							title={range !== "1d" ? "Coming soon - data collection in progress" : undefined}
						>
							{range === "1d" && "24H"}
							{range === "1w" && "7D"}
							{range === "1m" && "30D"}
						</button>
					))}
				</div>
			</div>

			{/* Leaderboard Content */}
			<div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-border/50 bg-card/50">
				{loading ? (
					<ScrollArea className="h-full">
						<div className="w-full">
							<div className="relative">
								<div className="sticky top-0 z-10 grid select-none grid-cols-12 border-border/50 border-b bg-card/95 py-2 font-mono text-[10px] text-muted-foreground uppercase tracking-wider backdrop-blur-sm sm:text-xs">
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
									<div key={i} className="group relative">
										<div className="relative grid grid-cols-12 items-center border-border/30 border-b py-2 sm:py-3">
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
						<Logo className="mx-auto mb-4 h-12 w-12 text-foreground/20" />
						<p className="font-mono text-destructive text-sm uppercase">ERROR::LOADING::LEADERBOARD</p>
						<p className="mt-2 font-mono text-muted-foreground/60 text-xs uppercase">CHECK_CONNECTION</p>
					</div>
				) : data.length === 0 ? (
					<div className="py-12 text-center">
						<Trophy className="mx-auto mb-4 h-12 w-12 animate-pulse text-foreground/20" />
						<p className="font-mono text-muted-foreground text-sm uppercase">NO::TRADING::DATA</p>
						<p className="mt-2 font-mono text-muted-foreground/60 text-xs uppercase">BE_THE_FIRST_TO_TRADE</p>
					</div>
				) : (
					<ScrollArea className="h-full">
						<div className="w-full">
							<div className="relative">
								{/* Header - Sticky like holders tab */}
								<div className="sticky top-0 z-10 grid select-none grid-cols-12 border-border/50 border-b bg-card/95 py-2 font-mono text-[10px] text-muted-foreground uppercase tracking-wider backdrop-blur-sm sm:text-xs">
									<div className="col-span-1 text-center"></div>
									<div className="col-span-5 pl-2">TRADER</div>
									<div
										className="col-span-3 flex cursor-pointer items-center justify-end gap-1 text-right transition-colors hover:text-foreground"
										onClick={() => handleSort("volume")}
									>
										VOLUME
										{sortBy === "volume" && <ArrowDown className="h-3 w-3" />}
									</div>
									<div
										className="col-span-3 flex cursor-pointer items-center justify-end gap-1 pr-4 text-right transition-colors hover:text-foreground"
										onClick={() => handleSort("trades")}
									>
										TRADES
										{sortBy === "trades" && <ArrowDown className="h-3 w-3" />}
									</div>
								</div>

								{/* Table Body */}
								{data.map((entry, index) => {
									const rank = entry.rank || index + 1
									const icon = getRankDisplay(rank)
									const suinsName = suinsNames?.[entry.user]

									// @dev: Ensure we have a user address
									if (!entry.user) {
										console.warn("Entry missing user:", entry)
										return null
									}

									return (
										<div
											key={`${entry.user}-${index}`}
											className="group relative transition-all duration-200 hover:bg-muted/5"
										>
											<div className="relative grid grid-cols-12 items-center border-border/30 border-b py-2 sm:py-3">
												{/* Rank */}
												<div className="col-span-1 flex justify-center">{icon}</div>

												{/* Trader Address */}
												<div className="col-span-5 flex items-center gap-2 pl-2">
													<div className="flex-1">
														{suinsName ? (
															<a
																href={`https://suivision.xyz/account/${entry.user}`}
																target="_blank"
																rel="noopener noreferrer"
																className="flex flex-col transition-opacity hover:opacity-80"
															>
																<span className="font-mono text-[10px] text-foreground sm:text-xs">
																	{suinsName}
																</span>
																<span className="font-mono text-[9px] text-muted-foreground sm:text-[10px]">
																	{formatAddress(entry.user)}
																</span>
															</a>
														) : (
															<a
																href={`https://suivision.xyz/account/${entry.user}`}
																target="_blank"
																rel="noopener noreferrer"
																className="font-mono text-[10px] text-muted-foreground transition-colors hover:text-primary sm:text-xs"
															>
																<span className="sm:hidden">
																	{formatAddress(entry.user).slice(0, 6) + "..."}
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
													<span className="font-mono text-[10px] text-foreground/80 sm:text-xs">
														{formatPrice(entry.totalVolume || 0)}
													</span>
												</div>

												{/* Trades */}
												<div className="col-span-3 pr-4 text-right">
													<span className="font-mono text-[10px] text-foreground/60 sm:text-xs">
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
