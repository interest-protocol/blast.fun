"use client"

import { useCallback } from "react"
import toast from "react-hot-toast"
import { CreatorRewardProps } from "./use-creator-rewards.types"

interface ClaimAllProps {
  rewards: CreatorRewardProps[]
  claimReward: (id: string) => Promise<boolean>
}

export const useClaimAllRewards = ({ rewards, claimReward }: ClaimAllProps) => {
  const claimAll = useCallback(async () => {
    if (rewards.length === 0) {
      toast.error("No rewards to claim")
      return false
    }

    let success = 0
    let fail = 0

    for (const r of rewards) {
      if (!r.claimed) {
        const ok = await claimReward(r.id)
        ok ? success++ : fail++
      }
    }

    if (success) toast.success(`Successfully claimed ${success} reward(s)`)
    if (fail) toast.error(`Failed to claim ${fail} reward(s)`)

    return success > 0
  }, [rewards, claimReward])

  return { claimAll }
}
