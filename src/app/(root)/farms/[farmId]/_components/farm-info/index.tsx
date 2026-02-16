"use client"

import { FC, useMemo } from "react"

import { FarmInfoProps } from "./farm-info.types"
import { useFarmOperations } from "../../_hooks/use-farm-operations"
import { POW_9, SECONDS_IN_YEAR } from "../../../farms.const"
import FarmInfoHeader from "./_components/farm-info-header"
import FarmInfoApr from "./_components/farm-info-apr"
import FarmPendingRewards from "./_components/farm-pending-rewards"
import { useFarmPrices } from "./_hooks/use-farm-prices"
import { useRewardMetadata } from "./_hooks/use-reward-metadata"
import { usePendingRewards } from "./_hooks/use-pending-rewards"

const FarmInfo: FC<FarmInfoProps> = ({ farm, account, metadata, onOperationSuccess }) => {
    const rewardCoinType = farm.rewardTypes[0] || ""

    const { stakeTokenPrice, rewardTokenPrice } = useFarmPrices(
        farm.stakeCoinType,
        rewardCoinType
    )

    const { rewardMetadata } = useRewardMetadata(rewardCoinType)
    const { pendingRewards, refreshCountdown } = usePendingRewards(
        account?.objectId,
        rewardCoinType
    )

    const tokenSymbol = metadata?.symbol || "UNKNOWN"
    const rewardSymbol = rewardMetadata?.symbol || "SUI"
    const rewardDecimals = rewardMetadata?.decimals || 9

    const tvlAmount = Number(farm.totalStakedAmount) / Number(POW_9)
    const tvlUsd = tvlAmount * stakeTokenPrice

    const { harvest, isHarvesting } = useFarmOperations({
        farmId: farm.objectId,
        stakeCoinType: farm.stakeCoinType,
        rewardCoinType,
        account,
        tokenSymbol,
        rewardSymbol,
        rewardDecimals,
        onSuccess: onOperationSuccess,
    })

    const isAprLoading = stakeTokenPrice === 0 || rewardTokenPrice === 0
    const apr = useMemo(() => {
        if (!rewardCoinType || !farm.rewardData[rewardCoinType] || stakeTokenPrice === 0 || rewardTokenPrice === 0) {
            return 0
        }

        const rewardData = farm.rewardData[rewardCoinType]
        const endTs = rewardData.end != null ? Number(rewardData.end) : null
        if (endTs != null && endTs > 0) {
            const now = Date.now()
            const ended = endTs > 1e12 ? now >= endTs : Math.floor(now / 1000) >= endTs
            if (ended) return 0
        }

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


    const tokenName = metadata?.name || tokenSymbol

    return (
        <div className="w-full border border-border/80 shadow-md rounded-lg bg-card/50 backdrop-blur-sm p-3 sm:p-6">
            <FarmInfoHeader
                tokenName={tokenName}
                tokenSymbol={tokenSymbol}
                metadata={metadata}
                tvlAmount={tvlAmount}
                tvlUsd={tvlUsd}
                stakeTokenPrice={stakeTokenPrice}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <FarmInfoApr apr={apr} isLoading={isAprLoading} />

                <FarmPendingRewards
                    pendingRewards={pendingRewards}
                    rewardSymbol={rewardSymbol}
                    rewardDecimals={rewardDecimals}
                    isHarvesting={isHarvesting}
                    isLoading={false}
                    refreshCountdown={refreshCountdown}
                    harvest={harvest}
                    account={account?.objectId}
                />
            </div>
        </div>
    )
}

export default FarmInfo