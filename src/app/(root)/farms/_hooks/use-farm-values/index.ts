import { POW_9 } from "../../farms.const"

export const useFarmValues = (farm: any, staked: bigint, stakeTokenPrice: number) => {
	const tvlAmount = Number(farm.totalStakedAmount) / Number(POW_9)
	const tvlUsd = tvlAmount * stakeTokenPrice

	const stakedAmount = Number(staked) / Number(POW_9)
	const stakedUsd = stakedAmount * stakeTokenPrice

	return { tvlAmount, tvlUsd, stakedAmount, stakedUsd }
}
