"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronRight } from "lucide-react"
import { formatNumberWithSuffix } from "@/utils/format"
import type { InterestFarm, InterestAccount } from "@interest-protocol/farms"
import { interestProtocolApi, CoinMetadata } from "@/lib/interest-protocol-api"
import { TokenAvatar } from "@/components/tokens/token-avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { SECONDS_IN_YEAR } from "../farms.const"
import { useSuiPrice } from "@/hooks/sui/use-sui-price"
import { fetchTokenByCoinType } from "@/lib/fetch-token-by-cointype"
import { useRouter } from "next/navigation"

interface FarmRowProps {
	farm: InterestFarm
	account?: InterestAccount
}

export function FarmRow({ farm, account }: FarmRowProps) {
	const router = useRouter()
	const [metadata, setMetadata] = useState<CoinMetadata | null>(null)
	const [stakeTokenPrice, setStakeTokenPrice] = useState<number>(0)
	const suiPrice = useSuiPrice()

	const rewardCoinType = farm.rewardTypes[0] || ""
	const staked = account?.stakeBalance || 0n

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
		const fetchMetadataAndPrice = async () => {
			try {
				const meta = await interestProtocolApi.getCoinMetadata(farm.stakeCoinType)
				setMetadata(meta)

				const tokenData = await fetchTokenByCoinType(farm.stakeCoinType)
				if (tokenData?.market?.price) {
					setStakeTokenPrice(tokenData.market.price)
				}
			} catch (error) {
				console.error("Failed to fetch token metadata or price:", error)
			}
		}

		fetchMetadataAndPrice()
	}, [farm.stakeCoinType])

	const tokenSymbol = metadata?.symbol || farm.stakeCoinType.split("::").pop() || "UNKNOWN"
	const tokenName = metadata?.name || tokenSymbol

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
						<p className="font-mono text-sm font-semibold">{formatNumberWithSuffix(Number(farm.totalStakeAmount) / 1e9)} {tokenSymbol}</p>
					</div>
					<div className="hidden md:flex flex-col items-end min-w-[120px]">
						<p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Your Stake</p>
						<p className="font-mono text-sm font-semibold">{formatNumberWithSuffix(Number(staked) / 1e9)} {tokenSymbol}</p>
					</div>
					<ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
				</div>
			</div>
		</button>
	)
}
