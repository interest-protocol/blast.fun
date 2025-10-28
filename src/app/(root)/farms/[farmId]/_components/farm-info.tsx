"use client"

import { useMemo, useEffect, useState } from "react"
import { TokenAvatar } from "@/components/tokens/token-avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { formatNumberWithSuffix } from "@/utils/format"
import type { InterestFarm, InterestAccount } from "@interest-protocol/farms"
import type { CoinMetadata } from "@/lib/interest-protocol-api"
import { useSuiPrice } from "@/hooks/sui/use-sui-price"
import { fetchTokenByCoinType } from "@/lib/fetch-token-by-cointype"
import { farmsSdk } from "@/lib/farms"
import { useFarmOperations } from "../_hooks/use-farm-operations"
import { SECONDS_IN_YEAR, POW_9 } from "../../farms.const"

interface FarmInfoProps {
	farm: InterestFarm
	account?: InterestAccount
	metadata: CoinMetadata | null
	onOperationSuccess: () => void
}

export function FarmInfo({ farm, account, metadata, onOperationSuccess }: FarmInfoProps) {
	const [stakeTokenPrice, setStakeTokenPrice] = useState<number>(0)
	const [pendingRewards, setPendingRewards] = useState<bigint>(0n)
	const [refreshCountdown, setRefreshCountdown] = useState<number>(60)
	const suiPrice = useSuiPrice()

	const rewardCoinType = farm.rewardTypes[0] || ""
	const tokenSymbol = metadata?.symbol || "UNKNOWN"

	const tvlAmount = Number(farm.totalStakeAmount) / Number(POW_9)
	const tvlUsd = tvlAmount * stakeTokenPrice

	const { harvest, isHarvesting } = useFarmOperations({
		farmId: farm.objectId,
		stakeCoinType: farm.stakeCoinType,
		rewardCoinType,
		account,
		tokenSymbol,
		onSuccess: onOperationSuccess,
	})

	const isAprLoading = suiPrice.loading || stakeTokenPrice === 0
	const apr = useMemo(() => {
		if (!rewardCoinType || !farm.rewardData[rewardCoinType] || suiPrice.loading || stakeTokenPrice === 0) {
			return 0
		}

		const rewardData = farm.rewardData[rewardCoinType]
		const rewardsPerSecond = rewardData.rewardsPerSecond
		const totalStakeAmount = farm.totalStakeAmount

		if (totalStakeAmount === 0n || rewardsPerSecond === 0n) {
			return 0
		}

		const numerator = Number(rewardsPerSecond) * Number(SECONDS_IN_YEAR) * suiPrice.usd
		const denominator = Number(totalStakeAmount) * stakeTokenPrice
		const aprValue = (numerator / denominator) * 100

		return isFinite(aprValue) ? aprValue : 0
	}, [rewardCoinType, farm.rewardData, farm.totalStakeAmount, suiPrice.usd, suiPrice.loading, stakeTokenPrice])

	useEffect(() => {
		const fetchPrice = async () => {
			try {
				const tokenData = await fetchTokenByCoinType(farm.stakeCoinType)
				if (tokenData?.market?.price) {
					setStakeTokenPrice(tokenData.market.price)
				}
			} catch (error) {
				console.error("Failed to fetch token price:", error)
			}
		}

		fetchPrice()
	}, [farm.stakeCoinType])

	// get pending rewards
	useEffect(() => {
		const fetchRewards = async () => {
			if (!account?.objectId) {
				setPendingRewards(0n)
				return
			}

			try {
				const rewards = await farmsSdk.pendingRewards(account.objectId)
				setPendingRewards(rewards[0].amount)
			} catch (error) {
				console.error("Failed to fetch pending rewards:", error)
			}
		}

		fetchRewards()
		setRefreshCountdown(60)

		const interval = setInterval(() => {
			fetchRewards()
			setRefreshCountdown(60)
		}, 60000)

		return () => clearInterval(interval)
	}, [account?.objectId, rewardCoinType])

	// countdown timer logic
	useEffect(() => {
		const countdown = setInterval(() => {
			setRefreshCountdown((prev) => (prev > 0 ? prev - 1 : 60))
		}, 1000)

		return () => clearInterval(countdown)
	}, [])

	const tokenName = metadata?.name || tokenSymbol

	const formatPercentage = (value: number): string => {
		if (value >= 1000000) {
			return `${(value / 1000000).toFixed(2)}M`
		}

		if (value >= 1000) {
			return `${(value / 1000).toFixed(2)}K`
		}

		return value.toFixed(2)
	}

	return (
		<div className="w-full border border-border/80 shadow-md rounded-lg bg-card/50 backdrop-blur-sm p-3 sm:p-6">
			{/* Header */}
			<div className="flex items-start sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-border/30">
				<div className="flex items-center gap-3 sm:gap-4">
					<TokenAvatar
						iconUrl={metadata?.iconUrl}
						symbol={tokenSymbol}
						className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg"
						enableHover={false}
					/>
					<div>
						<h2 className="font-mono text-lg sm:text-xl font-bold">{tokenName}</h2>
						<p className="font-mono text-xs sm:text-sm text-muted-foreground">{tokenSymbol}</p>
					</div>
				</div>
				<div className="text-right flex-shrink-0">
					<p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-1">TVL</p>
					<p className="font-mono text-lg font-semibold">
						{formatNumberWithSuffix(tvlAmount)} <span className="text-muted-foreground text-sm">{tokenSymbol}</span>
					</p>
					{stakeTokenPrice > 0 && (
						<p className="font-mono text-xs text-muted-foreground">${formatNumberWithSuffix(tvlUsd)}</p>
					)}
				</div>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
				{/* APR */}
				<div className="p-3 sm:p-4 rounded-lg border shadow-sm bg-muted/10">
					<p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-2">APR</p>
					{isAprLoading ? (
						<Skeleton className="h-6 sm:h-8 w-20 sm:w-24" />
					) : (
						<p className="font-mono text-xl sm:text-2xl font-bold text-green-500">{formatPercentage(apr)}%</p>
					)}
				</div>

				{/* Pending Rewards */}
				<div className="p-3 sm:p-4 rounded-lg border shadow-sm bg-muted/10">
					<div className="flex items-center justify-between mb-2">
					<p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Pending Rewards</p>
					<div className="relative w-4 h-4">
						<svg className="w-4 h-4 -rotate-90" viewBox="0 0 36 36">
							<circle
								cx="18"
								cy="18"
								r="16"
								fill="none"
								className="stroke-muted-foreground/20"
								strokeWidth="3"
							/>
							<circle
								cx="18"
								cy="18"
								r="16"
								fill="none"
								className="stroke-blue-400"
								strokeWidth="3"
								strokeDasharray="100"
								strokeDashoffset={100 - (refreshCountdown / 60) * 100}
								strokeLinecap="round"
							/>
						</svg>
					</div>
				</div>
					<div className="flex items-center justify-between gap-2">
						<div>
							<p className="font-mono text-base sm:text-lg font-semibold text-blue-400">
								{formatNumberWithSuffix(Number(pendingRewards) / Number(POW_9))}
							</p>
							<p className="font-mono text-xs text-muted-foreground mt-0.5">SUI</p>
						</div>
						{pendingRewards > 0n && (
							<Button
								onClick={harvest}
								disabled={isHarvesting || !account}
								size="sm"
								className="font-mono uppercase tracking-wider text-xs h-7 sm:h-8 px-2 sm:px-3 whitespace-nowrap"
							>
								{isHarvesting ? (
									<>
										<Loader2 className="h-3 w-3 animate-spin mr-1.5" />
										Harvesting...
									</>
								) : (
									"Harvest"
								)}
							</Button>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
