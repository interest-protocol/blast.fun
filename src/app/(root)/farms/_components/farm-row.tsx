"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronRight } from "lucide-react"
import { formatNumberWithSuffix } from "@/utils/format"
import type { InterestFarm, InterestAccount } from "@interest-protocol/farms"
import { interestProtocolApi, CoinMetadata } from "@/lib/interest-protocol-api"
import { TokenAvatar } from "@/components/tokens/token-avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { SECONDS_IN_YEAR, POW_9 } from "../farms.const"
import { nexaClient } from "@/lib/nexa"
import { useRouter } from "next/navigation"

interface FarmRowProps {
	farm: InterestFarm
	account?: InterestAccount
}

export function FarmRow({ farm, account }: FarmRowProps) {
	const router = useRouter()
	const [metadata, setMetadata] = useState<CoinMetadata | null>(null)
	const [stakeTokenPrice, setStakeTokenPrice] = useState<number>(0)
	const [rewardTokenPrice, setRewardTokenPrice] = useState<number>(0)

	const rewardCoinType = farm.rewardTypes[0] || ""
	const staked = account?.stakeBalance || 0n

	const isAprLoading = stakeTokenPrice === 0 || rewardTokenPrice === 0

	const apr = useMemo(() => {
		if (!rewardCoinType || !farm.rewardData[rewardCoinType] || stakeTokenPrice === 0 || rewardTokenPrice === 0) {
			return 0
		}

		const rewardData = farm.rewardData[rewardCoinType]
		const rewardsPerSecond = rewardData.rewardsPerSecond
		const totalStakedAmount = farm.totalStakedAmount

		if (totalStakedAmount === 0n || rewardsPerSecond === 0n) {
			return 0
		}

		const numerator = Number(rewardsPerSecond) * Number(SECONDS_IN_YEAR) * rewardTokenPrice
		const denominator = Number(totalStakedAmount) * stakeTokenPrice
		const aprValue = (numerator / denominator) * 100

		return isFinite(aprValue) ? aprValue : 0
	}, [rewardCoinType, farm.rewardData, farm.totalStakedAmount, rewardTokenPrice, stakeTokenPrice])

	useEffect(() => {
		const fetchMetadata = async () => {
			try {
				const meta = await interestProtocolApi.getCoinMetadata(farm.stakeCoinType)
				setMetadata(meta)
			} catch (error) {
				console.error("Failed to fetch token metadata:", error)
			}
		}

		fetchMetadata()
	}, [farm.stakeCoinType])

	useEffect(() => {
		const fetchPrices = async () => {
			if (!rewardCoinType) return

			try {
				const [stakeMarketData, rewardMarketData] = await Promise.all([
					nexaClient.getMarketData(farm.stakeCoinType),
					nexaClient.getMarketData(rewardCoinType),
				])

				if (stakeMarketData?.coinPrice) {
					setStakeTokenPrice(stakeMarketData.coinPrice)
				}

				if (rewardMarketData?.coinPrice) {
					setRewardTokenPrice(rewardMarketData.coinPrice)
				}
			} catch (error) {
				console.error("Failed to fetch token prices:", error)
			}
		}

		fetchPrices()
	}, [farm.stakeCoinType, rewardCoinType])

	const tokenSymbol = metadata?.symbol || farm.stakeCoinType.split("::").pop() || "UNKNOWN"
	const tokenName = metadata?.name || tokenSymbol

	const tvlAmount = Number(farm.totalStakedAmount) / Number(POW_9)
	const tvlUsd = tvlAmount * stakeTokenPrice
	const stakedAmount = Number(staked) / Number(POW_9)
	const stakedUsd = stakedAmount * stakeTokenPrice

	return (
		<button
			onClick={() => router.push(`/farms/${farm.objectId}`)}
			className="w-full border border-border/50 rounded-lg bg-card/50 backdrop-blur-sm overflow-hidden transition-all hover:border-border hover:cursor-pointer hover:bg-card/70"
		>
			<div className="flex items-center justify-between p-3 md:p-4">
				<div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
					<TokenAvatar iconUrl={metadata?.iconUrl} symbol={tokenSymbol} className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex-shrink-0" enableHover={false} />
					<div className="text-left min-w-0">
						<p className="font-mono text-xs md:text-sm font-semibold truncate">{tokenName}</p>
						<p className="font-mono text-xs text-muted-foreground">{tokenSymbol}</p>
					</div>
				</div>

				<div className="flex items-center gap-3 md:gap-8">
					<div className="flex flex-col items-end">
						<p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">APR</p>
						{isAprLoading ? (
							<Skeleton className="h-6 md:h-7 w-20" />
						) : (
							<p className="font-mono text-lg md:text-xl font-bold text-green-500">{apr.toFixed(2)}%</p>
						)}
					</div>
					<div className="hidden md:flex flex-col items-end min-w-[120px]">
						<p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">TVL</p>
						<p className="font-mono text-sm font-semibold">{formatNumberWithSuffix(tvlAmount)} {tokenSymbol}</p>
						{stakeTokenPrice > 0 && (
							<p className="font-mono text-xs text-muted-foreground">${formatNumberWithSuffix(tvlUsd)}</p>
						)}
					</div>
					<div className="hidden md:flex flex-col items-end min-w-[120px]">
						<p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Your Stake</p>
						<p className="font-mono text-sm font-semibold">{formatNumberWithSuffix(stakedAmount)} {tokenSymbol}</p>
						{stakeTokenPrice > 0 && staked > 0n && (
							<p className="font-mono text-xs text-muted-foreground">${formatNumberWithSuffix(stakedUsd)}</p>
						)}
					</div>
					<ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
				</div>
			</div>
		</button>
	)
}
