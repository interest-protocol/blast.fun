"use client"

import { useCallback, useState } from "react"
import toast from "react-hot-toast"
import { migratorSdk } from "@/lib/memez/sdk"
import { playSound } from "@/lib/audio"
import { useTransaction } from "@/hooks/sui/use-transaction"
import { CreatorRewardProps } from "./use-creator-rewards.types"

interface ClaimRewardProps {
  address?: string | null
  rewards: CreatorRewardProps[]
  refetch: () => Promise<void>
}

export const useClaimReward = ({ address, rewards, refetch }: ClaimRewardProps) => {
  const [isClaiming, setIsClaiming] = useState<string | null>(null)
  const { executeTransaction } = useTransaction()

  const claimReward = useCallback(
    async (rewardId: string) => {
      if (!address) {
        toast.error("Please connect your wallet")
        return false
      }

      const reward = rewards.find(r => r.id === rewardId)
      if (!reward) {
        toast.error("Reward not found")
        return false
      }

      setIsClaiming(rewardId)

      try {
        const { tx, suiCoin } = migratorSdk.collectFee({
          bluefinPool: reward.blueFinPoolId,
          memeCoinType: reward.memeCoinType,
          positionOwner: reward.objectId,
        })

        tx.transferObjects([suiCoin], tx.pure.address(address))

        const result = await executeTransaction(tx)

        if (result) {
          playSound("buy")
          toast.success("Successfully claimed rewards!")
          await refetch()
          return true
        }

        toast.error("Failed to claim rewards")
        return false
      } catch (err) {
        toast.error("Failed to claim rewards")
        console.error(err)
        return false
      } finally {
        setIsClaiming(null)
      }
    },
    [address, rewards, executeTransaction, refetch]
  )

  return { claimReward, isClaiming }
}
