"use client"

import { FC } from "react"
import { ChevronRight } from "lucide-react"

import { formatNumberWithSuffix } from "@/utils/format"
import { TokenAvatar } from "@/components/tokens/token-avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { FarmRowProps } from "./farm-row.types"
import { useFarmPrices } from "../../_hooks/use-farm-prices"
import { useFarmMetadata } from "../../_hooks/use-farm-metadata"
import { useFarmValues } from "../../_hooks/use-farm-values"
import useFarmApr from "../../_hooks/use-farm-apr"

const FarmRow: FC<FarmRowProps> = ({ farm, account }) => {
const router = useRouter()

	const rewardCoinType = farm.rewardTypes[0] || ""
	const staked = account?.stakeBalance || 0n

	const { metadata, tokenName, tokenSymbol } = useFarmMetadata(farm.stakeCoinType)
	const { stakeTokenPrice, rewardTokenPrice, isLoading: isPriceLoading } =
		useFarmPrices(farm.stakeCoinType, rewardCoinType)

	const apr = useFarmApr(farm, rewardCoinType, stakeTokenPrice, rewardTokenPrice)
	const { tvlAmount, tvlUsd, stakedAmount, stakedUsd } = useFarmValues(
		farm,
		staked,
		stakeTokenPrice
	)

	const isAprLoading = isPriceLoading || stakeTokenPrice === 0 || rewardTokenPrice === 0

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

export default FarmRow