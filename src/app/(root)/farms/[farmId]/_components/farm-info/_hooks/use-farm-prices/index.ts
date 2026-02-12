import { useEffect, useState } from "react"
import type { TokenMarketData } from "@/types/token"

async function fetchMarketData(coinType: string): Promise<TokenMarketData | null> {
  const res = await fetch(`/api/coin/${encodeURIComponent(coinType)}/market-data`)
  if (!res.ok) return null
  const data = await res.json()
  return data as TokenMarketData
}

export const useFarmPrices = (stakeCoinType: string, rewardCoinType: string | null) => {
  const [stakeTokenPrice, setStakeTokenPrice] = useState<number>(0)
  const [rewardTokenPrice, setRewardTokenPrice] = useState<number>(0)

  useEffect(() => {
    const fetchPrices = async () => {
      if (!rewardCoinType) return

      try {
        const [stake, reward] = await Promise.all([
          fetchMarketData(stakeCoinType),
          fetchMarketData(rewardCoinType),
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
