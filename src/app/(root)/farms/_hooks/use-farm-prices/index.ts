import { useEffect, useState } from "react"
import { nexaClient } from "@/lib/nexa"

export const useFarmPrices = (stakeCoinType: string, rewardCoinType: string) => {
	const [stakeTokenPrice, setStakeTokenPrice] = useState(0)
	const [rewardTokenPrice, setRewardTokenPrice] = useState(0)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		if (!rewardCoinType) return

		setIsLoading(true)

		Promise.all([nexaClient.getMarketData(stakeCoinType), nexaClient.getMarketData(rewardCoinType)])
			.then(([stakeData, rewardData]) => {
				if (stakeData?.coinPrice) setStakeTokenPrice(stakeData.coinPrice)
				if (rewardData?.coinPrice) setRewardTokenPrice(rewardData.coinPrice)
			})
			.catch((err) => console.error("Failed to fetch prices:", err))
			.finally(() => setIsLoading(false))
	}, [stakeCoinType, rewardCoinType])

	return { stakeTokenPrice, rewardTokenPrice, isLoading }
}
