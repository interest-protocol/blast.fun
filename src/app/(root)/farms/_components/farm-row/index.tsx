"use client"

import { FC } from "react"
import { ChevronRight } from "lucide-react"

import { TokenAvatar } from "@/components/tokens/token-avatar"
import { useRouter } from "next/navigation"
import { FarmRowProps } from "./farm-row.types"
import { useFarmPrices } from "../../_hooks/use-farm-prices"
import { useFarmMetadata } from "../../_hooks/use-farm-metadata"
import { useFarmValues } from "../../_hooks/use-farm-values"
import useFarmApr from "../../_hooks/use-farm-apr"
import { FarmTvl } from "./farm-tvl"
import FarmStake from "./farm-stake"
import FarmApr from "./farm-apr"
import TokenInfo from "./token-info"

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
				<TokenInfo
					iconUrl={metadata?.iconUrl || ""}
					tokenName={tokenName}
					tokenSymbol={tokenSymbol}
				/>

				<div className="flex items-center gap-3 md:gap-8">
					<FarmApr
						apr={apr}
						isLoading={isAprLoading}
					/>
					<FarmTvl
						tvlUsd={tvlUsd}
						tvlAmount={tvlAmount}
						tokenSymbol={tokenSymbol}
						stakeTokenPrice={stakeTokenPrice}
					/>
					<FarmStake
						staked={staked}
						stakedUsd={stakedUsd}
						tokenSymbol={tokenSymbol}
						stakedAmount={stakedAmount}
						stakeTokenPrice={stakeTokenPrice}
					/>
					<ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
				</div>
			</div>
		</button>
	)
}

export default FarmRow