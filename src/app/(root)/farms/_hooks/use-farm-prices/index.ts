import { useEffect, useState } from "react"

export const useFarmPrices = (stakeCoinType: string, rewardCoinType: string) => {
	const [stakeTokenPrice, setStakeTokenPrice] = useState(0)
	const [rewardTokenPrice, setRewardTokenPrice] = useState(0)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		if (!rewardCoinType) return

		setIsLoading(true)

		Promise.all([
			fetch(`/api/coin/${encodeURIComponent(stakeCoinType)}/market-data`).then((r) => r.ok ? r.json() : null),
			fetch(`/api/coin/${encodeURIComponent(rewardCoinType)}/market-data`).then((r) => r.ok ? r.json() : null),
		])
			.then(([stakeData, rewardData]) => {
				if (stakeData?.coinPrice != null) setStakeTokenPrice(stakeData.coinPrice)
				if (rewardData?.coinPrice != null) setRewardTokenPrice(rewardData.coinPrice)
			})
			.catch((err) => console.error("Failed to fetch prices:", err))
			.finally(() => setIsLoading(false))
	}, [stakeCoinType, rewardCoinType])

	return { stakeTokenPrice, rewardTokenPrice, isLoading }
}
