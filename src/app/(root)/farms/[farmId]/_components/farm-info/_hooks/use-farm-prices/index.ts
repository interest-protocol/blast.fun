import { useEffect, useState } from "react"
import { nexaClient } from "@/lib/nexa"

export const useFarmPrices = (stakeCoinType: string, rewardCoinType: string | null) => {
  const [stakeTokenPrice, setStakeTokenPrice] = useState<number>(0)
  const [rewardTokenPrice, setRewardTokenPrice] = useState<number>(0)

  useEffect(() => {
    const fetchPrices = async () => {
      if (!rewardCoinType) return

      try {
        const [stake, reward] = await Promise.all([
          nexaClient.getMarketData(stakeCoinType),
          nexaClient.getMarketData(rewardCoinType),
        ])

        if (stake?.coinPrice) setStakeTokenPrice(stake.coinPrice)
        if (reward?.coinPrice) setRewardTokenPrice(reward.coinPrice)
      } catch (error) {
        console.error("Failed to fetch token prices:", error)
      }
    }

    fetchPrices()
  }, [stakeCoinType, rewardCoinType])

  return { stakeTokenPrice, rewardTokenPrice }
}
