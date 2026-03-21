import { useEffect, useState } from "react"
import type { TokenMetadata } from "@/types/token"

export const useRewardMetadata = (rewardCoinType: string | null) => {
  const [rewardMetadata, setRewardMetadata] = useState<TokenMetadata | null>(null)

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!rewardCoinType) return

      try {
        const res = await fetch(`/api/coin/${encodeURIComponent(rewardCoinType)}/metadata`)
        if (!res.ok) return
        const metadata = (await res.json()) as TokenMetadata
        if (metadata) setRewardMetadata(metadata)
      } catch (error) {
        console.error("Failed to fetch reward token metadata:", error)
      }
    }

    fetchMetadata()
  }, [rewardCoinType])

  return { rewardMetadata }
}
