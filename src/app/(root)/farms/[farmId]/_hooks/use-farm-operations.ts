import { useState } from "react"
import { useApp } from "@/context/app.context"
import { useTransaction } from "@/hooks/sui/use-transaction"
import { farmsSdk } from "@/lib/farms"
import { coinWithBalance, Transaction } from "@mysten/sui/transactions"
import toast from "react-hot-toast"
import { FarmsSDK, type InterestAccount } from "@interest-protocol/farms"
import { formatNumberWithSuffix } from "@/utils/format"
import { parseInputAmount } from "../../farms.utils"
import { POW_9 } from "../../farms.const"

interface UseFarmOperationsProps {
	farmId: string
	stakeCoinType: string
	rewardCoinType: string
	account?: InterestAccount
	tokenSymbol?: string
	rewardSymbol?: string
	rewardDecimals?: number
	onSuccess?: () => void
}

export function useFarmOperations({
	farmId,
	stakeCoinType,
	rewardCoinType,
	account,
	tokenSymbol = "tokens",
	rewardSymbol = "SUI",
	rewardDecimals = 9,
	onSuccess,
}: UseFarmOperationsProps) {
	const { address } = useApp()
	const { executeTransaction } = useTransaction()
	const [isStaking, setIsStaking] = useState(false)
	const [isHarvesting, setIsHarvesting] = useState(false)
	const [isCompounding, setIsCompounding] = useState(false)
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
				const { tx, account } = await farmsSdk.newAccount({
					farm: farmId,
				})
				
				const { tx: stakeTx } = await farmsSdk.stakeUnchecked({
					tx,
					farm: farmId,
					account,
					depositCoin,
				})

				tx.transferObjects([account], tx.pure.address(address))

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
			const rewards = await farmsSdk.pendingRewards(account.objectId)
			const rewardsAmount = Number(rewards[0].amount) / Math.pow(10, rewardDecimals)

			const { tx, rewardCoin } = await farmsSdk.harvest({
				farm: farmId,
				account: account.objectId,
				rewardType: rewardCoinType,
			})

			tx.transferObjects([rewardCoin], address)
			await executeTransaction(tx)

			toast.success(`Harvested ${formatNumberWithSuffix(rewardsAmount)} ${rewardSymbol} rewards`)
			onSuccess?.()
		} catch (error) {
			console.error("Harvest error:", error)
			toast.error("Failed to harvest rewards")
		} finally {
			setIsHarvesting(false)
		}
	}

	const compound = async () => {
		if (!address || !account) {
			toast.error("No farm account found")
			return
		}

		setIsCompounding(true)
		try {
			const isMatchingType = rewardCoinType === stakeCoinType
			if (!isMatchingType) {
				setIsCompounding(false)
				return harvest()
			}

			const rewards = await farmsSdk.pendingRewards(account.objectId)
			const rewardsAmount = Number(rewards[0].amount) / Math.pow(10, rewardDecimals)

			const { tx, rewardCoin } = await farmsSdk.harvest({
				farm: farmId,
				account: account.objectId,
				rewardType: rewardCoinType,
			})

			await farmsSdk.stake({
				tx,
				farm: farmId,
				account: account.objectId,
				depositCoin: rewardCoin
			});

			await executeTransaction(tx)
			toast.success(`Harvested and restaked ${formatNumberWithSuffix(rewardsAmount)} ${tokenSymbol}`)
			onSuccess?.()
		} catch (error) {
			console.error("Compound error:", error)
			toast.error(`Failed to compound rewards for ${tokenSymbol}`)
		} finally {
			setIsStaking(false)
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

			const rewards = await farmsSdk.pendingRewards(account.objectId);
			const rewardsAmount = Number(rewards[0].amount) / Math.pow(10, rewardDecimals)
			const hasRewards = rewardsAmount > 0n

			const tx = new Transaction();

			// harvest rewards if available and withdrawing max amount
			if (hasRewards && isMaxWithdrawal) {
				const { rewardCoin } = await farmsSdk.harvest({
					tx,
					farm: farmId,
					account: account.objectId,
					rewardType: rewardCoinType,
				})

				tx.transferObjects([rewardCoin], address)
			}

			const { unstakeCoin } = await farmsSdk.unstake({
				tx,
				farm: farmId,
				account: account.objectId,
				amount: amountBigInt,
			})

			tx.transferObjects([unstakeCoin], address)
			await executeTransaction(tx)

			const amountInTokens = Number(amountBigInt) / Number(POW_9)
			if (hasRewards && isMaxWithdrawal) {
				toast.success(
					`Unstaked ${formatNumberWithSuffix(amountInTokens)} ${tokenSymbol} and harvested ${formatNumberWithSuffix(rewardsAmount)} ${rewardSymbol} rewards`
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
		compound,
		unstake,
		isStaking,
		isHarvesting,
		isCompounding,
		isUnstaking,
	}
}
