import { useEffect, useState } from "react"
import { nexaClient } from "@/lib/nexa"
import type { TokenMetadata } from "@/types/token"

export const useRewardMetadata = (rewardCoinType: string | null) => {
  const [rewardMetadata, setRewardMetadata] = useState<TokenMetadata | null>(null)

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!rewardCoinType) return

      try {
        const metadata = await nexaClient.getCoinMetadata(rewardCoinType)
        if (metadata) setRewardMetadata(metadata)
      } catch (error) {
        console.error("Failed to fetch reward token metadata:", error)
      }
    }

    fetchMetadata()
  }, [rewardCoinType])

  return { rewardMetadata }
}
