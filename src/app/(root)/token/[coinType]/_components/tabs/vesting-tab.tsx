"use client"

import { useState, useEffect, useMemo } from "react"
import { Token } from "@/types/token"
import { Lock, User, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useQuery } from "@tanstack/react-query"
import { formatAddress } from "@mysten/sui/utils"
import { useSuiNSNames } from "@/hooks/use-suins"
import { cn } from "@/utils"
import { useBreakpoint } from "@/hooks/use-breakpoint"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { VestingApi, type VestingPosition } from "@/lib/getVesting"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import BigNumber from "bignumber.js"
import { formatNumber, formatNumberWithPercentage } from "@/lib/format"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { vestingSdk } from "@/lib/pump"

interface VestingTabProps {
	pool: Token
	className?: string
}

interface VestingPositionWithProgress extends VestingPosition {
	totalAmount: string
	releasedAmount: string
	lockedAmount: string
	progressPercent: number
	isActive: boolean
	endTime: number
	claimableAmount: string
}

type SortField = "totalAmount" | "releasedAmount" | "lockedAmount" | "endTime"
type SortDirection = "asc" | "desc"

export function VestingTab({ pool, className }: VestingTabProps) {
	const [currentTime, setCurrentTime] = useState(Date.now())
	const { isMobile } = useBreakpoint()
	const router = useRouter()
	const [sortField, setSortField] = useState<SortField>("totalAmount")
	const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

	const { data: vestingData, isLoading, error } = useQuery({
		queryKey: ["all-vesting-positions", pool.coinType],
		queryFn: () => VestingApi.getAllVestingsByCoinType(pool.coinType),
		enabled: !!pool.coinType
	})

	// @dev: Calculate claimable amounts using SDK for all positions
	const { data: processedData, isLoading: isCalculatingClaimable } = useQuery({
		queryKey: ["vesting-positions-with-claimable", pool.coinType, vestingData?.data?.length],
		queryFn: async () => {
			if (!vestingData?.data?.length) return null

			// @dev: Calculate claimable amounts and fetch metadata in parallel
			const claimablePromises = vestingData.data.map(async (position) => {
				try {
					const claimable = await vestingSdk.calculateClaimable(position.objectId)
					return { objectId: position.objectId, claimableAmount: claimable.toString() }
				} catch (error) {
					console.error(`Failed to calculate claimable for ${position.objectId}:`, error)
					return { objectId: position.objectId, claimableAmount: "0" }
				}
			})

			// @dev: Get unique coin types and fetch metadata
			const uniqueCoinTypes = [...new Set(vestingData.data.map(p => p.coinType))]
			
			// @dev: Run claimablePromises and metadata fetch in parallel
			const [claimableResults, metadataResults] = await Promise.all([
				Promise.all(claimablePromises),
				VestingApi.getCoinMetadata(uniqueCoinTypes)
			])

			// @dev: Create decimals map for quick lookup
			const decimalsMap: Record<string, number> = {}
			metadataResults.forEach(metadata => {
				decimalsMap[metadata.type] = metadata.decimals
			})
			
			// @dev: Create map for quick lookup with decimal-adjusted claimable amounts
			const claimableMap = new Map(
				claimableResults.map(result => {
					const position = vestingData.data.find(p => p.objectId === result.objectId)
					const decimals = decimalsMap[position?.coinType || ""] || 9 // fallback to 9
					const formattedClaimable = (parseFloat(result.claimableAmount) / 10 ** decimals).toString()
					return [result.objectId, formattedClaimable]
				})
			)

			return {
				...vestingData,
				data: vestingData.data.map(position => ({
					...position,
					claimableAmount: claimableMap.get(position.objectId) || "0"
				}))
			}
		},
		enabled: !!vestingData?.data?.length && !!vestingSdk,
		staleTime: 30000, // 30 seconds
	})

	// @dev: Update current time every 30 seconds to keep remaining time accurate
	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentTime(Date.now())
		}, 30000)

		return () => clearInterval(interval)
	}, [])

	// @dev: Process and sort vesting positions with SDK-calculated claimable amounts
	const processedPositions: VestingPositionWithProgress[] = useMemo(() => {
		const dataToProcess = processedData?.data || vestingData?.data || []
		
		const processed = dataToProcess.map(position => {
			const now = currentTime
			const startTime = parseInt(position.start)
			const duration = parseInt(position.duration)
			const endTime = startTime + duration
			
			// @dev: Balance and released are already in human-readable format from API
			const balanceBN = new BigNumber(position.balance)
			const releasedBN = new BigNumber(position.released)
			const totalAmount = balanceBN.plus(releasedBN)
			
			// @dev: Use SDK-calculated claimable amount, fallback to 0 if not available
			const claimableAmount = new BigNumber((position as VestingPosition & { claimableAmount?: string }).claimableAmount || "0")
			
			// @dev: Total released = already claimed (released field) + currently claimable
			const totalReleasedAmount = releasedBN.plus(claimableAmount)
			const lockedAmount = balanceBN
			
			// @dev: Calculate progress percentage
			let progressPercent = 0
			if (now >= endTime) {
				progressPercent = 100
			} else if (now > startTime) {
				const elapsed = now - startTime
				progressPercent = (elapsed / duration) * 100
			}

			return {
				...position,
				totalAmount: totalAmount.toString(),
				releasedAmount: totalReleasedAmount.toString(),
				lockedAmount: lockedAmount.toString(),
				progressPercent,
				isActive: now >= startTime && now < endTime,
				endTime,
				claimableAmount: claimableAmount.toString()
			}
		})

		// @dev: Sort positions based on current sort field and direction
		return processed.sort((a, b) => {
			let aValue: number, bValue: number
			
			switch (sortField) {
				case "totalAmount":
					aValue = parseFloat(a.totalAmount)
					bValue = parseFloat(b.totalAmount)
					break
				case "releasedAmount":
					aValue = parseFloat(a.releasedAmount)
					bValue = parseFloat(b.releasedAmount)
					break
				case "lockedAmount":
					aValue = parseFloat(a.lockedAmount)
					bValue = parseFloat(b.lockedAmount)
					break
				case "endTime":
					aValue = a.endTime
					bValue = b.endTime
					break
				default:
					aValue = parseFloat(a.totalAmount)
					bValue = parseFloat(b.totalAmount)
			}
			
			const comparison = aValue - bValue
			return sortDirection === "desc" ? -comparison : comparison
		})
	}, [processedData?.data, vestingData?.data, currentTime, sortField, sortDirection])

	// @dev: Get unique addresses for SuiNS lookup
	const uniqueAddresses = useMemo(() => {
		return [...new Set(processedPositions.map(position => position.owner))]
	}, [processedPositions])

	const { data: suiNSNames } = useSuiNSNames(uniqueAddresses)

	// @dev: Handle sorting functionality
	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDirection(sortDirection === "desc" ? "asc" : "desc")
		} else {
			setSortField(field)
			setSortDirection("desc")
		}
	}

	const getSortIcon = (field: SortField) => {
		if (sortField !== field) return <ArrowUpDown className="h-3 w-3" />
		return sortDirection === "desc" 
			? <ArrowDown className="h-3 w-3" />
			: <ArrowUp className="h-3 w-3" />
	}

	const getSortFieldLabel = (field: SortField) => {
		switch (field) {
			case "totalAmount": return "Total Amount"
			case "releasedAmount": return "Released"
			case "lockedAmount": return "Remaining"
			case "endTime": return "Time Left"
			default: return "Total Amount"
		}
	}

	const formatVestingAmount = (amount: string, showPercentage?: boolean) => {
		// @dev: Amount is already in human-readable format from API, no need to apply decimals
		const numAmount = parseFloat(amount)
		if (isNaN(numAmount)) return "0"
		
		// @dev: Use format utilities instead of custom formatting
		return showPercentage ? formatNumberWithPercentage(numAmount) : formatNumber(numAmount)
	}

	const formatRemainingTime = (endTime: number) => {
		const now = currentTime
		const remaining = endTime - now
		
		if (remaining <= 0) {
			return "Completed"
		}
		
		const seconds = Math.floor(remaining / 1000)
		const minutes = Math.floor(seconds / 60)
		const hours = Math.floor(minutes / 60)
		const days = Math.floor(hours / 24)
		
		if (days > 0) {
			if (days > 30) {
				const months = Math.floor(days / 30)
				const remainingDays = days % 30
				return remainingDays > 0 ? `${months}mo ${remainingDays}d` : `${months}mo`
			}
			const remainingHours = hours % 24
			return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`
		} else if (hours > 0) {
			const remainingMinutes = minutes % 60
			return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
		} else if (minutes > 0) {
			return `${minutes}m`
		} else {
			return `${Math.max(1, seconds)}s`
		}
	}

	const getStatusBadge = (position: VestingPositionWithProgress) => {
		const now = currentTime
		const startTime = parseInt(position.start)
		
		if (position.isDestroyed) {
			return <span className="px-1.5 py-0.5 bg-destructive/10 rounded font-mono text-[9px] uppercase text-destructive">Destroyed</span>
		}
		
		if (now < startTime) {
			return <span className="px-1.5 py-0.5 bg-secondary/10 rounded font-mono text-[9px] uppercase text-muted-foreground">Pending</span>
		}
		
		if (position.progressPercent >= 100) {
			return <span className="px-1.5 py-0.5 bg-green-600/10 rounded font-mono text-[9px] uppercase text-green-600">Completed</span>
		}
		
		return <span className="px-1.5 py-0.5 bg-primary/10 rounded font-mono text-[9px] uppercase text-primary">Active</span>
	}

	if (error) {
		return (
			<div className={cn("flex flex-col h-full", className)}>
				<div className="flex-1 flex items-center justify-center">
					<div className="text-center">
						<Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
						<p className="text-muted-foreground">Failed to load vesting positions</p>
					</div>
				</div>
			</div>
		)
	}

	if (isLoading || isCalculatingClaimable) {
		return (
			<div className={cn("flex flex-col h-full", className)}>
				<div className="flex-1 flex items-center justify-center">
					<div className="text-center">
						<Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
						<p className="text-muted-foreground">Loading vesting positions...</p>
					</div>
				</div>
			</div>
		)
	}

	if (!vestingData?.data?.length && !processedData?.data?.length) {
		// @dev: Mobile layout for empty state
		if (isMobile) {
			return (
				<div className={cn("flex flex-col h-full", className)}>
					<div className="flex-1 flex items-center justify-center p-4">
						<div className="w-full max-w-sm">
							<div className="text-center mb-6">
								<Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
								<p className="text-muted-foreground">No vesting positions found</p>
								<p className="text-sm text-muted-foreground/60 mt-1">
									This token has no active vesting schedules
								</p>
							</div>
							{/* Add Vesting Card - Mobile Empty State */}
							<div
								className="bg-card border rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
								onClick={() => router.push(`/vesting?coin_type=${encodeURIComponent(pool.coinType)}`)}
							>
								<Plus className="h-8 w-8 mb-2 text-muted-foreground" />
								<span className="text-sm font-medium text-muted-foreground">Add Vesting</span>
							</div>
						</div>
					</div>
				</div>
			)
		}
		
		// @dev: Desktop layout for empty state
		return (
			<div className={cn("flex flex-col h-full", className)}>
				<div className="flex-1 flex items-center justify-center">
					<div className="text-center">
						<Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
						<p className="text-muted-foreground">No vesting positions found</p>
						<p className="text-sm text-muted-foreground/60 mt-1">
							This token has no active vesting schedules
						</p>
					</div>
				</div>
				{/* Bottom Row for Desktop - Empty State */}
				<div className="border-t p-4">
					<div className="flex items-center justify-between">
						<p className="text-sm text-muted-foreground">No vesting positions yet</p>
						<Button
							variant="outline"
							size="sm"
							onClick={() => router.push(`/vesting?coin_type=${encodeURIComponent(pool.coinType)}`)}
						>
							<Plus className="h-4 w-4 mr-2" />
							Add Vesting
						</Button>
					</div>
				</div>
			</div>
		)
	}

	// @dev: Mobile layout with cards instead of table
	if (isMobile) {
		return (
			<div className={cn("flex flex-col h-full", className)}>
				{/* Stats Header - Compact */}
				{(processedData?.stats || vestingData?.stats) && (
					<div className="p-3 border-b bg-muted/30">
						<div className="flex justify-between text-sm">
							<div>
								<p className="text-xs text-muted-foreground">Total Locked</p>
								<p className="font-semibold text-sm">
									{formatVestingAmount((processedData?.stats || vestingData?.stats)?.totalAmountLocked || "0", true)} {pool.metadata?.symbol}
								</p>
							</div>
							<div className="text-right">
								<p className="text-xs text-muted-foreground">Users</p>
								<p className="font-semibold text-sm">{(processedData?.stats || vestingData?.stats)?.numberOfUsers || 0}</p>
							</div>
						</div>
					</div>
				)}

				{/* Mobile Card Layout */}
				<div className="flex-1 overflow-y-auto">
					<div className="p-2 space-y-2">
						{processedPositions.map((position) => (
							<div
								key={position.objectId}
								className="bg-card border rounded-lg p-3 space-y-2"
							>
								{/* Owner and Status Row */}
								<div className="flex items-center justify-between">
									<div className="flex items-center">
										<Avatar className="h-5 w-5 mr-2">
											<AvatarImage src={`https://avatar.sui.io/${position.owner}`} />
											<AvatarFallback>
												<User className="h-3 w-3" />
											</AvatarFallback>
										</Avatar>
										<span className="font-mono text-xs">
											{formatAddress(position.owner)}
										</span>
									</div>
									{getStatusBadge(position)}
								</div>

								{/* Amount Row */}
								<div className="flex justify-between items-center">
									<div>
										<p className="text-xs text-muted-foreground">Total</p>
										<p className="font-semibold text-sm">
											{formatVestingAmount(position.totalAmount, true)}
										</p>
									</div>
									<div className="text-center">
										<p className="text-xs text-muted-foreground">Released</p>
										<p className="text-green-600 font-medium text-sm">
											{formatVestingAmount(position.releasedAmount)}
										</p>
									</div>
									<div className="text-right">
										<p className="text-xs text-muted-foreground">Remaining</p>
										<p className="text-orange-600 font-medium text-sm">
											{formatVestingAmount(position.lockedAmount)}
										</p>
									</div>
								</div>

								{/* Progress Bar */}
								<div>
									<div className="flex justify-between items-center mb-1">
										<span className="text-xs text-muted-foreground">Progress</span>
										<span className="text-xs font-medium">
											{position.progressPercent.toFixed(1)}%
										</span>
									</div>
									<div className="w-full bg-muted rounded-full h-1.5">
										<div
											className={cn(
												"h-1.5 rounded-full transition-all",
												position.progressPercent >= 100
													? "bg-green-600"
													: position.isActive
													? "bg-primary"
													: "bg-muted-foreground"
											)}
											style={{ width: `${Math.min(position.progressPercent, 100)}%` }}
										/>
									</div>
								</div>

								{/* Remaining Time */}
								<div className="text-center">
									<p className="text-xs text-muted-foreground">Time remaining</p>
									<p className="text-xs font-medium">
										{formatRemainingTime(position.endTime)}
									</p>
								</div>
							</div>
						))}
						
						{/* Add Vesting Card - Mobile (at bottom) */}
						<div
							className="bg-card border rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
							onClick={() => router.push(`/vesting?coin_type=${encodeURIComponent(pool.coinType)}`)}
						>
							<Plus className="h-8 w-8 mb-2 text-muted-foreground" />
							<span className="text-sm font-medium text-muted-foreground">Add Vesting</span>
						</div>
					</div>
				</div>
			</div>
		)
	}

	// @dev: Desktop layout with full table
	return (
		<div className={cn("flex flex-col h-full", className)}>
			{/* Stats Header with Sort Controls */}
			{(processedData?.stats || vestingData?.stats) && (
				<div className="p-4 border-b bg-muted/30">
					<div className="flex justify-between items-center">
						<div className="text-sm">
							<span className="text-muted-foreground">Total Locked: </span>
							<span className="font-semibold">
								{formatVestingAmount((processedData?.stats || vestingData?.stats)?.totalAmountLocked || "0", true)} {pool.metadata?.symbol}
							</span>
							<span className="text-muted-foreground ml-6">Total Users: </span>
							<span className="font-semibold">{(processedData?.stats || vestingData?.stats)?.numberOfUsers || 0}</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-xs text-muted-foreground">Sort by:</span>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="outline"
										size="sm"
										className="h-6 px-2 text-xs"
									>
										{getSortFieldLabel(sortField)} {getSortIcon(sortField)}
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-36">
									<DropdownMenuItem onClick={() => handleSort("totalAmount")}>
										<span className="flex items-center justify-between w-full">
											Total Amount
											{sortField === "totalAmount" && getSortIcon("totalAmount")}
										</span>
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleSort("releasedAmount")}>
										<span className="flex items-center justify-between w-full">
											Released
											{sortField === "releasedAmount" && getSortIcon("releasedAmount")}
										</span>
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleSort("lockedAmount")}>
										<span className="flex items-center justify-between w-full">
											Remaining
											{sortField === "lockedAmount" && getSortIcon("lockedAmount")}
										</span>
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleSort("endTime")}>
										<span className="flex items-center justify-between w-full">
											Time Left
											{sortField === "endTime" && getSortIcon("endTime")}
										</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</div>
			)}

			{/* Table Header */}
			<div className="grid grid-cols-12 py-2 border-b border-border/50 text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground sticky top-0 bg-background/95 backdrop-blur-sm z-10 select-none">
				<div className="col-span-1 text-center"></div>
				<div className="col-span-3 pl-2">Receiver</div>
				<div className="col-span-2 text-right">Total Amount</div>
				<div className="col-span-2 text-right">Released</div>
				<div className="col-span-2 text-right">Remaining</div>
				<div className="col-span-1 text-center">Status</div>
				<div className="col-span-1 text-right pr-2">Time Left</div>
			</div>

			{/* Table Content */}
			<ScrollArea className="flex-1">
				<div className="space-y-0">
					{processedPositions.map((position, index) => {
						const displayName = suiNSNames?.[position.owner] || formatAddress(position.owner)
						const rank = index + 1
						
						return (
							<div
								key={position.objectId}
								className="relative grid grid-cols-12 py-2 sm:py-3 items-center border-b border-border/30 hover:bg-muted/5 transition-all duration-200"
							>
								{/* Rank */}
								<div className="col-span-1 text-center">
									<div className="font-mono text-[10px] sm:text-xs text-muted-foreground">
										{rank}
									</div>
								</div>

								{/* Receiver */}
								<div className="col-span-3 flex items-center pl-2">
									<div className="flex-1">
										<a
											href={`https://suivision.xyz/account/${position.owner}`}
											target="_blank"
											rel="noopener noreferrer"
											className="font-mono text-[10px] sm:text-xs text-muted-foreground hover:text-primary transition-colors"
										>
											<span className="sm:hidden">
												{displayName.slice(0, 6) + '...'}
											</span>
											<span className="hidden sm:inline">
												{displayName}
											</span>
										</a>
									</div>
								</div>

								{/* Total Amount */}
								<div className="col-span-2 text-right font-mono text-[10px] sm:text-xs text-foreground/80">
									{formatVestingAmount(position.totalAmount, true)}
								</div>

								{/* Released Amount */}
								<div className="col-span-2 text-right font-mono text-[10px] sm:text-xs text-green-600">
									{formatVestingAmount(position.releasedAmount)}
								</div>

								{/* Remaining Amount */}
								<div className="col-span-2 text-right font-mono text-[10px] sm:text-xs text-orange-600">
									{formatVestingAmount(position.lockedAmount)}
								</div>

								{/* Status */}
								<div className="col-span-1 flex justify-center items-center">
									{getStatusBadge(position)}
								</div>

								{/* Remaining Time */}
								<div className="col-span-1 text-right pr-2 font-mono text-[10px] sm:text-xs text-foreground/60">
									{formatRemainingTime(position.endTime)}
								</div>
							</div>
						)
					})}
				</div>
			</ScrollArea>

			{/* Bottom Row for Desktop - Always show */}
			<div className="border-t p-4">
				<div className="flex items-center justify-between">
					<p className="text-sm text-muted-foreground">
						{processedPositions.length > 0 
							? `Showing all ${(processedData?.total || vestingData?.total || processedPositions.length)} vesting positions`
							: "No vesting positions yet"
						}
					</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => router.push(`/vesting?coin_type=${encodeURIComponent(pool.coinType)}`)}
					>
						<Plus className="h-4 w-4 mr-2" />
						Add Vesting
					</Button>
				</div>
			</div>
		</div>
	)
}