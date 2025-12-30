import { useState, useEffect } from "react"

import { nexaClient } from "@/lib/nexa"
import { useCallback } from "react"
import type { TokenMetadata } from "@/types/token"
import { useBalance } from "@/hooks/sui/use-balance"
import { FarmTerminalProps } from "../../farm-terminal.types"
import { useFarmOperations } from "../../../../_hooks/use-farm-operations"
import { POW_9 } from "@/app/(root)/farms/farms.const"

const useFarmTerminal = ({
  farm,
  account,
  metadata,
  onOperationSuccess,
}: FarmTerminalProps) => {
  const [actionType, setActionType] = useState<"deposit" | "withdraw">("deposit")
  const [amount, setAmount] = useState("")
  const [rewardMetadata, setRewardMetadata] = useState<TokenMetadata | null>(null)

  const { balance: tokenBalance } = useBalance(farm.stakeCoinType)
  const tokenBalanceBigInt = BigInt(tokenBalance || "0")
  const tokenBalanceInDisplayUnit = Number(tokenBalanceBigInt) / Number(POW_9)

  const rewardCoinType = farm.rewardTypes[0] ?? ""
  const staked = account?.stakeBalance || 0n
  const stakedInDisplayUnit = Number(staked) / Number(POW_9)

  const tokenSymbol = metadata?.symbol || "TOKEN"
  const rewardSymbol = rewardMetadata?.symbol || "SUI"
  const rewardDecimals = rewardMetadata?.decimals || 9

  useEffect(() => {
    const fetchRewardMetadata = async () => {
      if (!rewardCoinType) return
      try {
        const md = await nexaClient.getCoinMetadata(rewardCoinType)
        if (md) setRewardMetadata(md)
      } catch (error) {
        console.error("Failed to fetch reward token metadata:", error)
      }
    }
    fetchRewardMetadata()
  }, [rewardCoinType])

  const { stake, unstake, isStaking, isUnstaking } = useFarmOperations({
    farmId: farm.objectId,
    stakeCoinType: farm.stakeCoinType,
    rewardCoinType,
    account,
    tokenSymbol,
    rewardSymbol,
    rewardDecimals,
    onSuccess: () => {
      setAmount("")
      onOperationSuccess()
    },
  })

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) return
    await stake(amount)
  }

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) return
    await unstake(amount)
  }

 const handleMaxClick = useCallback(() => {
  const balance = actionType === "deposit" ? tokenBalanceInDisplayUnit : stakedInDisplayUnit
  if (balance <= 0) {
    setAmount("0")
    return
  }
  setAmount(balance.toString())
}, [actionType, tokenBalanceInDisplayUnit, stakedInDisplayUnit])

const handleQuickAmount = useCallback((percentage: number) => {
  const balance = actionType === "deposit" ? tokenBalanceInDisplayUnit : stakedInDisplayUnit
  if (balance <= 0) {
    setAmount("0")
    return
  }
  const calculated = (balance * percentage) / 100
  setAmount(calculated.toString())
}, [actionType, tokenBalanceInDisplayUnit, stakedInDisplayUnit])

  const isProcessing = isStaking || isUnstaking

  return {
    actionType,
    setActionType,
    amount,
    setAmount,
    rewardMetadata,
    tokenBalanceInDisplayUnit,
    stakedInDisplayUnit,
    tokenSymbol,
    rewardSymbol,
    rewardDecimals,
    isProcessing,
    handleDeposit,
    handleWithdraw,
    handleMaxClick,
    handleQuickAmount,
  }
}

export default useFarmTerminal