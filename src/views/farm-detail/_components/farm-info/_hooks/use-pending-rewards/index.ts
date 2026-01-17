import { useEffect, useState } from "react"
import { farmsSdk } from "@/lib/farms"

export const usePendingRewards = (accountId?: string, rewardCoinType?: string | null) => {
  const [pendingRewards, setPendingRewards] = useState<bigint>(0n)
  const [refreshCountdown, setRefreshCountdown] = useState(60)

  useEffect(() => {
    const fetchRewards = async () => {
      if (!accountId) {
        setPendingRewards(0n)
        return
      }

      try {
        const rewards = await farmsSdk.pendingRewards(accountId)
        setPendingRewards(rewards[0].amount)
      } catch (error) {
        console.error("Failed to fetch pending rewards:", error)
      }
    }

    fetchRewards()
    setRefreshCountdown(60)

    const interval = setInterval(() => {
      fetchRewards()
      setRefreshCountdown(60)
    }, 60000)

    return () => clearInterval(interval)
  }, [accountId, rewardCoinType])

  useEffect(() => {
    const countdown = setInterval(() => {
      setRefreshCountdown((prev) => (prev > 0 ? prev - 1 : 60))
    }, 1000)

    return () => clearInterval(countdown)
  }, [])

  return { pendingRewards, refreshCountdown }
}
