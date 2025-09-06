"use client"

import { formatAddress } from "@mysten/sui/utils"
import { useQuery } from "@tanstack/react-query"
import { Building2, ExternalLink, Users } from "lucide-react"
import { useMemo, useState } from "react"
import { Logo } from "@/components/ui/logo"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { PROJECT_WALLETS } from "@/constants/project-wallets"
import { useSuiNSNames } from "@/hooks/use-suins"
import { Token } from "@/types/token"
import { cn } from "@/utils"
import { formatNumberWithSuffix } from "@/utils/format"

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

	return <HoldersTab pool={pool} className={className} activeTab={activeTab} onTabChange={setActiveTab} />
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
		return data.holders.filter((holder) => PROJECT_WALLETS[holder.account])
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
		return displayHolders.map((h) => h.account) || []
	}, [displayHolders])

	// @dev: Fetch SuiNS names for all holders
	const { data: suinsNames } = useSuiNSNames(holderAddresses)

	if (isLoading) {
		return (
			<div className="w-full">
				{/* Header Skeleton */}
				<div className="grid grid-cols-12 border-border/50 border-b py-2">
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
					<div key={i} className="grid grid-cols-12 items-center border-border/30 border-b py-3">
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
				<Logo className="mx-auto mb-4 h-12 w-12 text-foreground/20" />
				<p className="font-mono text-destructive text-sm uppercase">ERROR::LOADING::HOLDERS</p>
				<p className="mt-2 font-mono text-muted-foreground/60 text-xs uppercase">CHECK_CONNECTION</p>
			</div>
		)
	}

	if (!data?.holders || data.holders.length === 0) {
		return (
			<div className="py-12 text-center">
				<Users className="mx-auto mb-4 h-12 w-12 animate-pulse text-foreground/20" />
				<p className="font-mono text-muted-foreground text-sm uppercase">NO::HOLDERS::FOUND</p>
				<p className="mt-2 font-mono text-muted-foreground/60 text-xs uppercase">LIQUIDITY_POOLS_NOT_DETECTED</p>
			</div>
		)
	}

	// @dev: Check if there are no project holders for the projects tab
	if (activeTab === "projects" && projectHolders.length === 0) {
		return (
			<div className="py-12 text-center">
				<Building2 className="mx-auto mb-4 h-12 w-12 animate-pulse text-foreground/20" />
				<p className="font-mono text-muted-foreground text-sm uppercase">NO::PROJECTS::HOLDING</p>
				<p className="mt-2 font-mono text-muted-foreground/60 text-xs uppercase">NO_ECOSYSTEM_PROJECTS_FOUND</p>
			</div>
		)
	}

	return (
		<ScrollArea className={cn(className || "h-[500px]")}>
			<div className="w-full">
				<div className="relative">
					{/* Header */}
					<div className="sticky top-0 z-10 grid select-none grid-cols-12 border-border/50 border-b bg-background/95 py-2 font-mono text-[10px] text-muted-foreground uppercase tracking-wider backdrop-blur-sm sm:text-xs">
						<div className="col-span-1 text-center"></div>
						<div className="col-span-5 pl-2">ADDRESS</div>
						<div className="col-span-3 text-right">HOLDINGS</div>
						<div className="col-span-3 pr-2 text-right">SHARE %</div>
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
						const isBurn =
							holder.account === "0x0000000000000000000000000000000000000000000000000000000000000000"

						return (
							<div
								key={holder.account}
								className="group relative transition-all duration-200 hover:bg-muted/5"
							>
								<div className="relative grid grid-cols-12 items-center border-border/30 border-b py-2 sm:py-3">
									{/* Rank */}
									<div className="col-span-1 text-center">
										<div className="font-mono text-[10px] text-muted-foreground sm:text-xs">{rank}</div>
									</div>

									{/* Address */}
									<div className="col-span-5 flex items-center gap-2 pl-2">
										{holder.image && (
											<img
												src={holder.image}
												alt={holder.name || "Holder"}
												className="h-5 w-5 rounded-full sm:h-6 sm:w-6"
											/>
										)}
										<div className="flex-1">
											<div className="flex items-center gap-2">
												{projectName ? (
													<a
														href={`https://suivision.xyz/account/${holder.account}`}
														target="_blank"
														rel="noopener noreferrer"
														className="flex flex-col transition-opacity hover:opacity-80"
													>
														<div className="flex items-center gap-1">
															<span className="font-mono text-[10px] text-primary sm:text-xs">
																{projectName}
															</span>
															<ExternalLink className="h-2.5 w-2.5 opacity-50" />
														</div>
														<span className="font-mono text-[9px] text-muted-foreground sm:text-[10px]">
															{formatAddress(holder.account)}
														</span>
													</a>
												) : holder.name ? (
													<a
														href={`https://suivision.xyz/account/${holder.account}`}
														target="_blank"
														rel="noopener noreferrer"
														className="flex flex-col transition-opacity hover:opacity-80"
													>
														<div className="flex items-center gap-1">
															<span className="font-mono text-[10px] text-primary sm:text-xs">
																{holder.name}
															</span>
															{holder.website && (
																<ExternalLink className="h-2.5 w-2.5 opacity-50" />
															)}
														</div>
														<span className="font-mono text-[9px] text-muted-foreground sm:text-[10px]">
															{formatAddress(holder.account)}
														</span>
													</a>
												) : suinsName ? (
													<a
														href={`https://suivision.xyz/account/${holder.account}`}
														target="_blank"
														rel="noopener noreferrer"
														className="flex flex-col transition-opacity hover:opacity-80"
													>
														<span className="font-mono text-[10px] text-foreground sm:text-xs">
															{suinsName}
														</span>
														<span className="font-mono text-[9px] text-muted-foreground sm:text-[10px]">
															{formatAddress(holder.account)}
														</span>
													</a>
												) : (
													<a
														href={`https://suivision.xyz/account/${holder.account}`}
														target="_blank"
														rel="noopener noreferrer"
														className="font-mono text-[10px] text-muted-foreground transition-colors hover:text-primary sm:text-xs"
													>
														<span className="sm:hidden">
															{formatAddress(holder.account).slice(0, 6) + "..."}
														</span>
														<span className="hidden sm:inline">
															{formatAddress(holder.account)}
														</span>
													</a>
												)}
												{/* Labels for special wallets */}
												{isDev && (
													<span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] text-primary uppercase">
														DEV
													</span>
												)}
												{isBurn && (
													<span className="rounded bg-destructive/10 px-1.5 py-0.5 font-mono text-[9px] text-destructive uppercase">
														BURN
													</span>
												)}
											</div>
										</div>
									</div>

									{/* Holdings */}
									<div className="col-span-3 text-right font-mono text-[10px] text-foreground/80 sm:text-xs">
										{formattedBalance}
									</div>

									{/* Percentage */}
									<div className="col-span-3 pr-2 text-right">
										<span
											className={cn(
												"font-bold font-mono text-[10px] sm:text-xs",
												percentage >= 10
													? "text-destructive"
													: percentage >= 5
														? "text-yellow-500"
														: "text-foreground/60"
											)}
										>
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
