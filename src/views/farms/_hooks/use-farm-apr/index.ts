import { useMemo } from "react"
import { SECONDS_IN_YEAR } from "../../farms.const"

export const useFarmApr = (farm: any, rewardCoinType: string, stakeTokenPrice: number, rewardTokenPrice: number) => {
	return useMemo(() => {
		if (!rewardCoinType) return 0

		const rewardData = farm.rewardData[rewardCoinType]
		if (!rewardData) return 0

		const rewardsPerSecond = rewardData.rewardsPerSecond
		const totalStakedAmount = farm.totalStakedAmount

		if (totalStakedAmount === 0n || rewardsPerSecond === 0n) return 0

		const numerator = Number(rewardsPerSecond) * Number(SECONDS_IN_YEAR) * rewardTokenPrice
		const denominator = Number(totalStakedAmount) * stakeTokenPrice

		const apr = (numerator / denominator) * 100
		return isFinite(apr) ? apr : 0
	}, [farm, rewardCoinType, stakeTokenPrice, rewardTokenPrice])
}

export default useFarmApr
