import { useEffect, useState } from "react"

export const useFarmPrices = (stakeCoinType: string, rewardCoinType: string | null) => {
  const [stakeTokenPrice, setStakeTokenPrice] = useState<number>(0)
  const [rewardTokenPrice, setRewardTokenPrice] = useState<number>(0)

  useEffect(() => {
    const fetchPrices = async () => {
      if (!rewardCoinType) return

      try {
        const [stakeRes, rewardRes] = await Promise.all([
          fetch(`/api/coin/${encodeURIComponent(stakeCoinType)}/market-data`),
          fetch(`/api/coin/${encodeURIComponent(rewardCoinType)}/market-data`),
        ])
        const stake = stakeRes.ok ? await stakeRes.json() : null
        const reward = rewardRes.ok ? await rewardRes.json() : null

        if (stake?.coinPrice != null) setStakeTokenPrice(stake.coinPrice)
        if (reward?.coinPrice != null) setRewardTokenPrice(reward.coinPrice)
      } catch (error) {
        console.error("Failed to fetch token prices:", error)
      }
    }

    fetchPrices()
  }, [stakeCoinType, rewardCoinType])

  return { stakeTokenPrice, rewardTokenPrice }
}
