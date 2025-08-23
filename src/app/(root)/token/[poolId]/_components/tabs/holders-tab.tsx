"use client"

import { useMemo } from "react"
import { PoolWithMetadata } from "@/types/pool"
import { Users, ExternalLink, Trophy } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useQuery } from "@tanstack/react-query"
import { formatAddress } from "@mysten/sui/utils"
import { cn } from "@/utils"
import { Logo } from "@/components/ui/logo"
import { Skeleton } from "@/components/ui/skeleton"
import { useSuiNSNames } from "@/hooks/use-suins"

interface HoldersTabProps {
	pool: PoolWithMetadata
	className?: string
}

interface CoinHolder {
	account: string
	balance: string
	percentage: string
	name: string
	image: string
	website: string
}

interface HoldersResponse {
	holders: CoinHolder[]
	timestamp: number
}

export function HoldersTab({ pool, className }: HoldersTabProps) {
	const { data, isLoading, error } = useQuery<HoldersResponse>({
		queryKey: ["holders", pool.coinType],
		queryFn: async () => {
			const response = await fetch(`/api/coin/holders/${encodeURIComponent(pool.coinType)}`)
			if (!response.ok) {
				throw new Error("Failed to fetch holders")
			}
			return response.json()
		},
		enabled: !!pool.coinType,
		refetchInterval: 15000, // @dev: Refetch every 15 seconds (matches edge cache)
		staleTime: 10000, // @dev: Consider data stale after 10 seconds
	})

	// @dev: Get all holder addresses for SuiNS resolution
	const holderAddresses = useMemo(() => {
		return data?.holders.map(h => h.account) || []
	}, [data?.holders])

	// @dev: Fetch SuiNS names for all holders
	const { data: suinsNames } = useSuiNSNames(holderAddresses)

	if (isLoading) {
		return (
			<div className="p-4 space-y-3">
				{Array.from({ length: 10 }).map((_, i) => (
					<div key={i} className="flex items-center justify-between py-3 border-b border-border/30">
						<div className="flex items-center gap-3">
							<Skeleton className="w-8 h-8 rounded-full" />
							<div className="space-y-1">
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-3 w-20" />
							</div>
						</div>
						<div className="text-right">
							<Skeleton className="h-4 w-16 ml-auto" />
							<Skeleton className="h-3 w-24 mt-1" />
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
				<p className="font-mono text-sm uppercase text-destructive">ERROR::LOADING::HOLDERS</p>
				<p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">CHECK_CONNECTION</p>
			</div>
		)
	}

	if (!data?.holders || data.holders.length === 0) {
		return (
			<div className="text-center py-12">
				<Users className="w-12 h-12 mx-auto text-foreground/20 mb-4 animate-pulse" />
				<p className="font-mono text-sm uppercase text-muted-foreground">
					NO::HOLDERS::FOUND
				</p>
				<p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">
					LIQUIDITY_POOLS_NOT_DETECTED
				</p>
			</div>
		)
	}

	return (
		<ScrollArea className={cn(className || "h-[500px]")}>
			<div className="w-full">
				<div className="relative">
					{/* Header */}
					<div className="grid grid-cols-12 gap-2 px-2 sm:px-4 py-2 border-b border-border/50 text-[10px] sm:text-xs font-mono uppercase text-muted-foreground sticky top-0 bg-background/95 backdrop-blur-sm z-10 select-none">
						<div className="col-span-1">Rank</div>
						<div className="col-span-6">Address</div>
						<div className="col-span-3 text-right">Balance</div>
						<div className="col-span-2 text-right">Share</div>
					</div>

					{/* Holders List */}
					{data.holders.map((holder, index) => {
						const rank = index + 1
						const isTop3 = rank <= 3
						const percentage = parseFloat(holder.percentage) * 100 // @dev: Convert decimal to percentage
						const suinsName = suinsNames?.[holder.account]

						return (
							<div
								key={holder.account}
								className="relative group hover:bg-muted/5 transition-all duration-200"
							>
								{/* Background gradient for percentage */}
								<div
									className={cn(
										"absolute inset-0 opacity-5 transition-all duration-500",
										isTop3 ? "bg-yellow-500" : "bg-primary"
									)}
									style={{ width: `${Math.min(percentage * 10, 100)}%` }} 
								/>

								<div className="relative grid grid-cols-12 gap-2 px-2 sm:px-4 py-2 sm:py-3 items-center border-b border-border/30">
									{/* Rank */}
									<div className="col-span-1">
										<div className={cn(
											"flex items-center justify-center w-6 h-6 rounded-full font-mono text-[10px] sm:text-xs font-bold",
											isTop3 ? "bg-yellow-500/10 text-yellow-500" : "text-muted-foreground"
										)}>
											{isTop3 ? (
												<Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
											) : (
												rank
											)}
										</div>
									</div>

									{/* Address */}
									<div className="col-span-6 flex items-center gap-2">
										{holder.image && (
											<img 
												src={holder.image} 
												alt={holder.name || "Holder"} 
												className="w-5 h-5 sm:w-6 sm:h-6 rounded-full"
											/>
										)}
										<div className="flex-1">
											{holder.name ? (
												<div className="flex flex-col">
													<div className="flex items-center gap-1">
														{holder.website ? (
															<a
																href={holder.website}
																target="_blank"
																rel="noopener noreferrer"
																className="font-mono text-[10px] sm:text-xs text-primary hover:underline flex items-center gap-1"
															>
																{holder.name}
																<ExternalLink className="h-2.5 w-2.5 opacity-50" />
															</a>
														) : (
															<span className="font-mono text-[10px] sm:text-xs text-primary">
																{holder.name}
															</span>
														)}
													</div>
													<a
														href={`https://suivision.xyz/account/${holder.account}`}
														target="_blank"
														rel="noopener noreferrer"
														className="font-mono text-[9px] sm:text-[10px] text-muted-foreground hover:text-primary transition-colors"
													>
														{formatAddress(holder.account)}
													</a>
												</div>
											) : suinsName ? (
												<div className="flex flex-col">
													<span className="font-mono text-[10px] sm:text-xs text-foreground">
														{suinsName}
													</span>
													<a
														href={`https://suivision.xyz/account/${holder.account}`}
														target="_blank"
														rel="noopener noreferrer"
														className="font-mono text-[9px] sm:text-[10px] text-muted-foreground hover:text-primary transition-colors"
													>
														{formatAddress(holder.account)}
													</a>
												</div>
											) : (
												<a
													href={`https://suivision.xyz/account/${holder.account}`}
													target="_blank"
													rel="noopener noreferrer"
													className="font-mono text-[10px] sm:text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
												>
													<span className="sm:hidden">{formatAddress(holder.account).slice(0, 8) + '...'}</span>
													<span className="hidden sm:inline">{formatAddress(holder.account)}</span>
												</a>
											)}
										</div>
									</div>

									{/* Balance */}
									<div className="col-span-3 text-right font-mono text-[10px] sm:text-xs text-foreground/80">
										{holder.balance}
									</div>

									{/* Percentage */}
									<div className="col-span-2 text-right">
										<span className={cn(
											"font-mono text-[10px] sm:text-xs font-bold",
											percentage >= 10 ? "text-destructive" : 
											percentage >= 5 ? "text-yellow-500" : 
											"text-foreground/60"
										)}>
											{percentage.toFixed(3)}%
										</span>
									</div>
								</div>
							</div>
						)
					})}

				</div>
			</div>
		</ScrollArea>
	)
}