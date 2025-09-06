"use client"

import { useState, useEffect, useMemo } from "react"
import { Token } from "@/types/token"
import { Lock, User } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useQuery } from "@tanstack/react-query"
import { formatAddress } from "@mysten/sui/utils"
import { cn } from "@/utils"
import { useBreakpoint } from "@/hooks/use-breakpoint"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { VestingApi, type VestingPosition } from "@/lib/getVesting"
import { Badge } from "@/components/ui/badge"
import BigNumber from "bignumber.js"

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
}

export function VestingTab({ pool, className }: VestingTabProps) {
	const [currentTime, setCurrentTime] = useState(Date.now())
	const { isMobile } = useBreakpoint()

	const { data: vestingData, isLoading, error } = useQuery({
		queryKey: ["all-vesting-positions", pool.coinType],
		queryFn: () => VestingApi.getAllVestingsByCoinType(pool.coinType),
		enabled: !!pool.coinType
	})

	// @dev: Update current time every 30 seconds to keep remaining time accurate
	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentTime(Date.now())
		}, 30000)

		return () => clearInterval(interval)
	}, [])

	// @dev: Process vesting positions to calculate progress
	const processedPositions: VestingPositionWithProgress[] = useMemo(() => (vestingData?.data || []).map(position => {
		const now = currentTime
		const startTime = parseInt(position.start)
		const duration = parseInt(position.duration)
		const endTime = startTime + duration
		
		// @dev: Balance and released are already in human-readable format from API
		const balanceBN = new BigNumber(position.balance)
		const releasedBN = new BigNumber(position.released)
		const totalAmount = balanceBN.plus(releasedBN)
		const releasedAmount = releasedBN
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
			releasedAmount: releasedAmount.toString(),
			lockedAmount: lockedAmount.toString(),
			progressPercent,
			isActive: now >= startTime && now < endTime,
			endTime
		}
	}), [vestingData?.data, currentTime])

	const formatVestingAmount = (amount: string) => {
		// @dev: Amount is already in human-readable format from API, no need to apply decimals
		const numAmount = parseFloat(amount)
		if (isNaN(numAmount)) return "0"
		
		// @dev: Format with suffix for large numbers
		if (numAmount >= 1e9) {
			return `${(numAmount / 1e9).toFixed(2)}B`
		} else if (numAmount >= 1e6) {
			return `${(numAmount / 1e6).toFixed(2)}M`
		} else if (numAmount >= 1e3) {
			return `${(numAmount / 1e3).toFixed(2)}K`
		} else if (numAmount < 0.01 && numAmount > 0) {
			return numAmount.toFixed(6)
		} else {
			return numAmount.toFixed(2)
		}
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
			return <Badge variant="destructive" className="text-xs">Destroyed</Badge>
		}
		
		if (now < startTime) {
			return <Badge variant="secondary" className="text-xs">Pending</Badge>
		}
		
		if (position.progressPercent >= 100) {
			return <Badge variant="default" className="text-xs bg-green-600">Completed</Badge>
		}
		
		return <Badge variant="default" className="text-xs">Active</Badge>
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

	if (isLoading) {
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

	if (!vestingData?.data?.length) {
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
			</div>
		)
	}

	// @dev: Mobile layout with cards instead of table
	if (isMobile) {
		return (
			<div className={cn("flex flex-col h-full", className)}>
				{/* Stats Header - Compact */}
				{vestingData.stats && (
					<div className="p-3 border-b bg-muted/30">
						<div className="flex justify-between text-sm">
							<div>
								<p className="text-xs text-muted-foreground">Total Locked</p>
								<p className="font-semibold text-sm">
									{formatVestingAmount(vestingData.stats.totalAmountLocked)} {pool.metadata?.symbol}
								</p>
							</div>
							<div className="text-right">
								<p className="text-xs text-muted-foreground">Users</p>
								<p className="font-semibold text-sm">{vestingData.stats.numberOfUsers}</p>
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
											{formatVestingAmount(position.totalAmount)}
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
					</div>
				</div>

				{/* Total Count */}
				{vestingData && vestingData.data.length > 0 && (
					<div className="border-t p-3">
						<p className="text-xs text-muted-foreground text-center">
							{vestingData.total} position{vestingData.total !== 1 ? 's' : ''}
						</p>
					</div>
				)}
			</div>
		)
	}

	// @dev: Desktop layout with full table
	return (
		<div className={cn("flex flex-col h-full", className)}>
			{/* Stats Header */}
			{vestingData.stats && (
				<div className="p-4 border-b bg-muted/30">
					<div className="grid grid-cols-2 gap-4 text-sm">
						<div>
							<p className="text-muted-foreground">Total Locked</p>
							<p className="font-semibold">
								{formatVestingAmount(vestingData.stats.totalAmountLocked)} {pool.metadata?.symbol}
							</p>
						</div>
						<div>
							<p className="text-muted-foreground">Total Users</p>
							<p className="font-semibold">{vestingData.stats.numberOfUsers}</p>
						</div>
					</div>
				</div>
			)}

			{/* Table Header */}
			<div className="grid grid-cols-12 gap-2 px-4 py-3 border-b bg-muted/20 text-xs font-medium text-muted-foreground uppercase tracking-wider">
				<div className="col-span-2">Owner</div>
				<div className="col-span-2">Total Amount</div>
				<div className="col-span-2">Released</div>
				<div className="col-span-2">Remaining</div>
				<div className="col-span-2">Progress</div>
				<div className="col-span-1">Status</div>
				<div className="col-span-1">Remaining</div>
			</div>

			{/* Table Content */}
			<ScrollArea className="flex-1">
				<div className="space-y-0">
					{processedPositions.map((position) => (
						<div
							key={position.objectId}
							className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-border/50 hover:bg-muted/30 transition-colors"
						>
							{/* Owner */}
							<div className="col-span-2 flex items-center">
								<Avatar className="h-6 w-6 mr-2">
									<AvatarImage src={`https://avatar.sui.io/${position.owner}`} />
									<AvatarFallback>
										<User className="h-3 w-3" />
									</AvatarFallback>
								</Avatar>
								<span className="font-mono text-xs">
									{formatAddress(position.owner)}
								</span>
							</div>

							{/* Total Amount */}
							<div className="col-span-2 flex items-center">
								<span className="font-semibold">
									{formatVestingAmount(position.totalAmount)}
								</span>
							</div>

							{/* Released Amount */}
							<div className="col-span-2 flex items-center">
								<span className="text-green-600 font-medium">
									{formatVestingAmount(position.releasedAmount)}
								</span>
							</div>

							{/* Remaining Amount */}
							<div className="col-span-2 flex items-center">
								<span className="text-orange-600 font-medium">
									{formatVestingAmount(position.lockedAmount)}
								</span>
							</div>

							{/* Progress */}
							<div className="col-span-2 flex items-center">
								<div className="w-full">
									<div className="flex justify-between items-center mb-1">
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
							</div>

							{/* Status */}
							<div className="col-span-1 flex items-center">
								{getStatusBadge(position)}
							</div>

							{/* Remaining Time */}
							<div className="col-span-1 flex items-center">
								<span className="text-xs font-medium">
									{formatRemainingTime(position.endTime)}
								</span>
							</div>
						</div>
					))}
				</div>
			</ScrollArea>

			{/* Total Count */}
			{vestingData && vestingData.data.length > 0 && (
				<div className="border-t p-4">
					<p className="text-sm text-muted-foreground text-center">
						Showing all {vestingData.total} vesting positions
					</p>
				</div>
			)}
		</div>
	)
}