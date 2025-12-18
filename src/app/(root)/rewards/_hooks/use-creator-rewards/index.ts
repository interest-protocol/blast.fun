"use client"

import { useApp } from "@/context/app.context"
import { useEffect } from "react"
import { useFetchRewards } from "./use-fetch-rewards"
import { useClaimReward } from "./use-claim-reward"
import { useClaimAllRewards } from "./use-claim-all-rewards"
import { useTransferPosition } from "./use-transfer-position"

export const useCreatorRewards = () => {
  const { address } = useApp()

  const {
    rewards,
    isLoading,
    error,
    fetchRewards,
    setRewards,
  } = useFetchRewards(address)

  const { claimReward, isClaiming } = useClaimReward({
    address,
    rewards,
    refetch: fetchRewards,
  })

  const { claimAll } = useClaimAllRewards({
    rewards,
    claimReward,
  })

  const { transferPosition, isTransferring } = useTransferPosition({
    address,
    rewards,
    refetch: fetchRewards,
  })

  useEffect(() => {
    if (address) fetchRewards()
    else setRewards([])
  }, [address, fetchRewards, setRewards])

  return {
    rewards,
    isLoading,
    error,
    isClaiming,
    isTransferring,
    claimReward,
    claimAllRewards: claimAll,
    transferPosition,
    refetch: fetchRewards,
  }
}
