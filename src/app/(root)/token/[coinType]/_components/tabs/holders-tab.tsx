"use client"

import { useMemo, useState } from "react"
import { Token } from "@/types/token"
import { Users, ExternalLink, Building2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useQuery } from "@tanstack/react-query"
import { formatAddress } from "@mysten/sui/utils"
import { cn } from "@/utils"
import { Logo } from "@/components/ui/logo"
import { Skeleton } from "@/components/ui/skeleton"
import { useSuiNSNames } from "@/hooks/use-suins"
import { formatNumberWithSuffix } from "@/utils/format"
import { PROJECT_WALLETS } from "@/constants/project-wallets"

interface HoldersTabProps {
	pool: Token
	className?: string
	activeTab?: "holders" | "projects"
	onTabChange?: (tab: "holders" | "projects") => void
}

interface HoldersWithTabsProps {
	pool: Token
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

// @dev: Wrapper component that manages state
export function HoldersWithTabs({ pool, className }: HoldersWithTabsProps) {
	const [activeTab, setActiveTab] = useState<"holders" | "projects">("holders")
	
	return (
		<HoldersTab 
			pool={pool} 
			className={className} 
			activeTab={activeTab} 
			onTabChange={setActiveTab} 
		/>
	)
}

export function HoldersTab({ pool, className, activeTab = "holders", onTabChange }: HoldersTabProps) {
	
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

	// @dev: Filter project holders from the main holders list
	const projectHolders = useMemo(() => {
		if (!data?.holders) return []
		return data.holders.filter(holder => PROJECT_WALLETS[holder.account])
	}, [data?.holders])

	// @dev: Get display holders based on active tab
	const displayHolders = useMemo(() => {
		if (activeTab === "projects") {
			return projectHolders
		}
		return data?.holders || []
	}, [activeTab, data?.holders, projectHolders])

	// @dev: Get all holder addresses for SuiNS resolution
	const holderAddresses = useMemo(() => {
		return displayHolders.map(h => h.account) || []
	}, [displayHolders])

	// @dev: Fetch SuiNS names for all holders
	const { data: suinsNames } = useSuiNSNames(holderAddresses)

	if (isLoading) {
		return (
			<div className="w-full">
				{/* Header Skeleton */}
				<div className="grid grid-cols-12 py-2 border-b border-border/50">
					<div className="col-span-1"></div>
					<div className="col-span-5 pl-2">
						<Skeleton className="h-3 w-16" />
					</div>
					<div className="col-span-3 flex justify-end">
						<Skeleton className="h-3 w-16" />
					</div>
					<div className="col-span-3 flex justify-end pr-2">
						<Skeleton className="h-3 w-16" />
					</div>
				</div>
				
				{/* Holders List Skeleton */}
				{Array.from({ length: 10 }).map((_, i) => (
					<div key={i} className="grid grid-cols-12 py-3 items-center border-b border-border/30">
						{/* Rank */}
						<div className="col-span-1 flex justify-center">
							<Skeleton className="h-3 w-3" />
						</div>
						
						{/* Address */}
						<div className="col-span-5 pl-2">
							<Skeleton className="h-3 w-24" />
						</div>
						
						{/* Holdings */}
						<div className="col-span-3 flex justify-end">
							<Skeleton className="h-3 w-16" />
						</div>
						
						{/* Percentage */}
						<div className="col-span-3 flex justify-end pr-2">
							<Skeleton className="h-3 w-12" />
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

	// @dev: Check if there are no project holders for the projects tab
	if (activeTab === "projects" && projectHolders.length === 0) {
		return (
			<div className="text-center py-12">
				<Building2 className="w-12 h-12 mx-auto text-foreground/20 mb-4 animate-pulse" />
				<p className="font-mono text-sm uppercase text-muted-foreground">
					NO::PROJECTS::HOLDING
				</p>
				<p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">
					NO_ECOSYSTEM_PROJECTS_FOUND
				</p>
			</div>
		)
	}

	return (
		<ScrollArea className={cn(className || "h-[500px]")}>
				<div className="w-full">
					<div className="relative">
						{/* Header */}
						<div className="grid grid-cols-12 py-2 border-b border-border/50 text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground sticky top-0 bg-background/95 backdrop-blur-sm z-10 select-none">
							<div className="col-span-1 text-center"></div>
							<div className="col-span-5 pl-2">ADDRESS</div>
							<div className="col-span-3 text-right">HOLDINGS</div>
							<div className="col-span-3 text-right pr-2">SHARE %</div>
						</div>

						{/* Holders List */}
						{displayHolders.map((holder, index) => {
						const rank = index + 1
						// @dev: Calculate percentage - if empty from API, calculate from balance / 1B total supply
						let percentage: number
						if (!holder.percentage || holder.percentage === "") {
							const balanceNum = parseFloat(holder.balance.replace(/,/g, ""))
							percentage = (balanceNum / 1_000_000_000) * 100
						} else {
							percentage = parseFloat(holder.percentage) * 100 // @dev: Convert decimal to percentage
						}
						const suinsName = suinsNames?.[holder.account]
						// @dev: Check if this is a project wallet
						const projectName = PROJECT_WALLETS[holder.account]
						// @dev: Format balance with K/M suffix
						const balanceNum = parseFloat(holder.balance.replace(/,/g, ""))
						const formattedBalance = formatNumberWithSuffix(balanceNum)
						// @dev: Check if this holder is the developer
						const isDev = holder.account === pool.creator?.address
						// @dev: Check if this is the burn address
						const isBurn = holder.account === "0x0000000000000000000000000000000000000000000000000000000000000000"

						return (
							<div
								key={holder.account}
								className="relative group hover:bg-muted/5 transition-all duration-200"
							>
								<div className="relative grid grid-cols-12 py-2 sm:py-3 items-center border-b border-border/30">
									{/* Rank */}
									<div className="col-span-1 text-center">
										<div className="font-mono text-[10px] sm:text-xs text-muted-foreground">
											{rank}
										</div>
									</div>

									{/* Address */}
									<div className="col-span-5 flex items-center gap-2 pl-2">
										{holder.image && (
											<img 
												src={holder.image} 
												alt={holder.name || "Holder"} 
												className="w-5 h-5 sm:w-6 sm:h-6 rounded-full"
											/>
										)}
										<div className="flex-1">
											<div className="flex items-center gap-2">
												{projectName ? (
													<a
														href={`https://suivision.xyz/account/${holder.account}`}
														target="_blank"
														rel="noopener noreferrer"
														className="flex flex-col hover:opacity-80 transition-opacity"
													>
														<div className="flex items-center gap-1">
															<span className="font-mono text-[10px] sm:text-xs text-primary">
																{projectName}
															</span>
															<ExternalLink className="h-2.5 w-2.5 opacity-50" />
														</div>
														<span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground">
															{formatAddress(holder.account)}
														</span>
													</a>
												) : holder.name ? (
													<a
														href={`https://suivision.xyz/account/${holder.account}`}
														target="_blank"
														rel="noopener noreferrer"
														className="flex flex-col hover:opacity-80 transition-opacity"
													>
														<div className="flex items-center gap-1">
															<span className="font-mono text-[10px] sm:text-xs text-primary">
																{holder.name}
															</span>
															{holder.website && (
																<ExternalLink className="h-2.5 w-2.5 opacity-50" />
															)}
														</div>
														<span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground">
															{formatAddress(holder.account)}
														</span>
													</a>
												) : suinsName ? (
													<a
														href={`https://suivision.xyz/account/${holder.account}`}
														target="_blank"
														rel="noopener noreferrer"
														className="flex flex-col hover:opacity-80 transition-opacity"
													>
														<span className="font-mono text-[10px] sm:text-xs text-foreground">
															{suinsName}
														</span>
														<span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground">
															{formatAddress(holder.account)}
														</span>
													</a>
												) : (
													<a
														href={`https://suivision.xyz/account/${holder.account}`}
														target="_blank"
														rel="noopener noreferrer"
														className="font-mono text-[10px] sm:text-xs text-muted-foreground hover:text-primary transition-colors"
													>
														<span className="sm:hidden">
															{formatAddress(holder.account).slice(0, 6) + '...'}
														</span>
														<span className="hidden sm:inline">
															{formatAddress(holder.account)}
														</span>
													</a>
												)}
												{/* Labels for special wallets */}
												{isDev && (
													<span className="px-1.5 py-0.5 bg-primary/10 rounded font-mono text-[9px] uppercase text-primary">
														DEV
													</span>
												)}
												{isBurn && (
													<span className="px-1.5 py-0.5 bg-destructive/10 rounded font-mono text-[9px] uppercase text-destructive">
														BURN
													</span>
												)}
											</div>
										</div>
									</div>

									{/* Holdings */}
									<div className="col-span-3 text-right font-mono text-[10px] sm:text-xs text-foreground/80">
										{formattedBalance}
									</div>

									{/* Percentage */}
									<div className="col-span-3 text-right pr-2">
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