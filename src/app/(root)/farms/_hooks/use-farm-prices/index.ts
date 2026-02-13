import { useEffect, useState } from "react"
import type { TokenMarketData } from "@/types/token"

async function fetchMarketData(coinType: string): Promise<TokenMarketData | null> {
	const res = await fetch(`/api/coin/${encodeURIComponent(coinType)}/market-data`)
	if (!res.ok) return null
	const data = await res.json()
	return data as TokenMarketData
}

export const useFarmPrices = (stakeCoinType: string, rewardCoinType: string) => {
	const [stakeTokenPrice, setStakeTokenPrice] = useState(0)
	const [rewardTokenPrice, setRewardTokenPrice] = useState(0)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		if (!rewardCoinType) return

		setIsLoading(true)

		Promise.all([fetchMarketData(stakeCoinType), fetchMarketData(rewardCoinType)])
			.then(([stakeData, rewardData]) => {
				if (stakeData?.coinPrice) setStakeTokenPrice(stakeData.coinPrice)
				if (rewardData?.coinPrice) setRewardTokenPrice(rewardData.coinPrice)
			})
			.catch((err) => console.error("Failed to fetch prices:", err))
			.finally(() => setIsLoading(false))
	}, [stakeCoinType, rewardCoinType])

	return { stakeTokenPrice, rewardTokenPrice, isLoading }
}
