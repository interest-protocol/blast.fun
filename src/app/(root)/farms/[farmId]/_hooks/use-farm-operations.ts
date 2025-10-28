import { useState } from "react"
import { useApp } from "@/context/app.context"
import { useTransaction } from "@/hooks/sui/use-transaction"
import { farmsSdk } from "@/lib/farms"
import { coinWithBalance } from "@mysten/sui/transactions"
import toast from "react-hot-toast"
import type { InterestAccount } from "@interest-protocol/farms"
import { formatNumberWithSuffix } from "@/utils/format"
import { parseInputAmount } from "../../farms.utils"
import { POW_9 } from "../../farms.const"

interface UseFarmOperationsProps {
	farmId: string
	stakeCoinType: string
	rewardCoinType: string
	account?: InterestAccount
	tokenSymbol?: string
	onSuccess?: () => void
}

export function useFarmOperations({
	farmId,
	stakeCoinType,
	rewardCoinType,
	account,
	tokenSymbol = "tokens",
	onSuccess,
}: UseFarmOperationsProps) {
	const { address } = useApp()
	const { executeTransaction } = useTransaction()
	const [isStaking, setIsStaking] = useState(false)
	const [isHarvesting, setIsHarvesting] = useState(false)
	const [isUnstaking, setIsUnstaking] = useState(false)

	const stake = async (amount: string) => {
		if (!address) {
			toast.error("Please connect your wallet")
			return
		}

		setIsStaking(true)
		try {
			const amountBigInt = parseInputAmount(amount)
			if (amountBigInt <= 0n) {
				toast.error("Invalid stake amount")
				return
			}

			const depositCoin = coinWithBalance({
				balance: amountBigInt,
				type: stakeCoinType,
			})

			if (!account) {
				const { tx: createAccountTx, account: newAccountRef } = await farmsSdk.newAccount({
					farm: farmId,
				})

				createAccountTx.transferObjects([newAccountRef], createAccountTx.pure.address(address))
				await executeTransaction(createAccountTx)

				const allAccounts = await farmsSdk.getAccounts(address)
				const newAccount = allAccounts.find((acc) => acc.farm === farmId)
				if (!newAccount) {
					throw new Error("Failed to find newly created farm account")
				}

				const { tx: stakeTx } = await farmsSdk.stake({
					farm: farmId,
					account: newAccount.objectId,
					depositCoin,
				})

				await executeTransaction(stakeTx)
			} else {
				const { tx } = await farmsSdk.stake({
					farm: farmId,
					account: account.objectId,
					depositCoin,
				})

				await executeTransaction(tx)
			}

			const amountInTokens = Number(amountBigInt) / Number(POW_9)
			toast.success(`Staked ${formatNumberWithSuffix(amountInTokens)} ${tokenSymbol}`)
			onSuccess?.()
		} catch (error) {
			console.error("Staking error:", error)
			toast.error(`Failed to stake ${tokenSymbol}`)
		} finally {
			setIsStaking(false)
		}
	}

	const harvest = async () => {
		if (!address || !account) {
			toast.error("No farm account found")
			return
		}

		setIsHarvesting(true)
		try {
			const pendingRewards = account.rewards[rewardCoinType] || 0n
			const rewardsInSui = Number(pendingRewards) / Number(POW_9)

			const { tx, rewardCoin } = await farmsSdk.harvest({
				farm: farmId,
				account: account.objectId,
				rewardType: rewardCoinType,
			})

			tx.transferObjects([rewardCoin], address)
			await executeTransaction(tx)

			toast.success(`Harvested ${formatNumberWithSuffix(rewardsInSui)} SUI rewards`)
			onSuccess?.()
		} catch (error) {
			console.error("Harvest error:", error)
			toast.error("Failed to harvest rewards")
		} finally {
			setIsHarvesting(false)
		}
	}

	const unstake = async (amount: string) => {
		if (!address || !account) {
			toast.error("No farm account found")
			return
		}

		setIsUnstaking(true)
		try {
			const amountBigInt = parseInputAmount(amount)
			if (amountBigInt <= 0n) {
				toast.error("Invalid unstake amount")
				return
			}

			const isMaxWithdrawal = amountBigInt === account.stakeBalance
			const pendingRewards = account.rewards[rewardCoinType] || 0n
			const hasRewards = pendingRewards > 0n

			// harvest rewards if available and withdrawing max amount
			if (hasRewards && isMaxWithdrawal) {
				const { tx: harvestTx, rewardCoin } = await farmsSdk.harvest({
					farm: farmId,
					account: account.objectId,
					rewardType: rewardCoinType,
				})

				harvestTx.transferObjects([rewardCoin], address)
				await executeTransaction(harvestTx)
			}

			const { tx, unstakeCoin } = await farmsSdk.unstake({
				farm: farmId,
				account: account.objectId,
				amount: amountBigInt,
			})

			tx.transferObjects([unstakeCoin], address)
			await executeTransaction(tx)

			const amountInTokens = Number(amountBigInt) / Number(POW_9)
			const rewardsInSui = Number(pendingRewards) / Number(POW_9)

			if (hasRewards && isMaxWithdrawal) {
				toast.success(
					`Unstaked ${formatNumberWithSuffix(amountInTokens)} ${tokenSymbol} and harvested ${formatNumberWithSuffix(rewardsInSui)} SUI rewards`
				)
			} else {
				toast.success(`Unstaked ${formatNumberWithSuffix(amountInTokens)} ${tokenSymbol}`)
			}

			onSuccess?.()
		} catch (error) {
			console.error("Unstake error:", error)
			toast.error(`Failed to unstake ${tokenSymbol}`)
		} finally {
			setIsUnstaking(false)
		}
	}

	return {
		stake,
		harvest,
		unstake,
		isStaking,
		isHarvesting,
		isUnstaking,
	}
}
