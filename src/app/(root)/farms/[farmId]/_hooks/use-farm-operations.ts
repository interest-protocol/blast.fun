import { useState } from "react"
import { useApp } from "@/context/app.context"
import { useTransaction } from "@/hooks/sui/use-transaction"
import { farmsSdk } from "@/lib/farms"
import { coinWithBalance, Transaction } from "@mysten/sui/transactions"
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
	rewardSymbol?: string
	rewardDecimals?: number
	onSuccess?: () => void
}

export const useFarmOperations = ({
	farmId,
	stakeCoinType,
	rewardCoinType,
	account,
	tokenSymbol = "tokens",
	rewardSymbol = "SUI",
	rewardDecimals = 9,
	onSuccess,
}: UseFarmOperationsProps) => {
	const { address } = useApp()
	const { executeTransaction } = useTransaction()
	const [isStaking, setIsStaking] = useState(false)
	const [isHarvesting, setIsHarvesting] = useState(false)
	const [isUnstaking, setIsUnstaking] = useState(false)

	const getAccountWithHighestStake = async (): Promise<InterestAccount | undefined> => {
		if (!address) return undefined

		const allAccounts = await farmsSdk.getAccounts(address)
		const farmAccounts = allAccounts.filter((acc) => acc.farm === farmId)

		return farmAccounts.sort((a, b) =>
			Number(b.stakeBalance - a.stakeBalance)
		)[0]
	}

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
				setIsStaking(false)
				return
			}

			const depositCoin = coinWithBalance({
				balance: amountBigInt,
				type: stakeCoinType,
			})

			const existingAccount = await getAccountWithHighestStake()

			if (existingAccount) {
				const { tx } = await farmsSdk.stake({
					farm: farmId,
					account: existingAccount.objectId,
					depositCoin,
				})

				await executeTransaction(tx)

				const amountInTokens = Number(amountBigInt) / Number(POW_9)
				toast.success(`Staked ${formatNumberWithSuffix(amountInTokens)} ${tokenSymbol}`)
				onSuccess?.()
				return
			}

			toast("Creating new farm account...", { icon: "🔨", duration: 3000 })

			const { tx, account: newAccount } = await farmsSdk.newAccount({
				farm: farmId,
			})

			const { tx: stakeTx } = await farmsSdk.stakeUnchecked({
				tx,
				farm: farmId,
				account: newAccount,
				depositCoin,
			})

			stakeTx.transferObjects([newAccount], stakeTx.pure.address(address))

			await executeTransaction(stakeTx)

			const amountInTokens = Number(amountBigInt) / Number(POW_9)
			toast.success(`Created account and staked ${formatNumberWithSuffix(amountInTokens)} ${tokenSymbol}`)
			onSuccess?.()

		} catch (error) {
			console.error("Staking error:", error)

			if (error instanceof Error) {
				const errorMsg = error.message.toLowerCase()
				
				if (errorMsg.includes("rejected") || errorMsg.includes("user rejected")) {
					toast.error("Transaction rejected by user")
				} else if (errorMsg.includes("insufficient") || errorMsg.includes("balance")) {
					toast.error("Insufficient balance")
				} else if (errorMsg.includes("gas")) {
					toast.error("Insufficient gas to complete transaction")
				} else if (errorMsg.includes("object") && errorMsg.includes("not found")) {
					toast.error("Account not found. Please refresh and try again.")
				} else {
					const shortMsg = error.message.split('\n')[0].slice(0, 100)
					toast.error(`Failed to stake: ${shortMsg}`)
				}
			} else {
				toast.error(`Failed to stake ${tokenSymbol}`)
			}
			
			setTimeout(() => {
				onSuccess?.()
			}, 2000)
		} finally {
			setIsStaking(false)
		}
	}

	const harvest = async () => {
		const accountToUse = await getAccountWithHighestStake()

		if (!address || !accountToUse) {
			toast.error("No farm account found")
			return
		}

		setIsHarvesting(true)
		try {
			const rewards = await farmsSdk.pendingRewards(accountToUse.objectId)
			const rewardsAmount = Number(rewards[0].amount) / Math.pow(10, rewardDecimals)

			if (rewardsAmount === 0) {
				toast.error("No rewards to harvest")
				setIsHarvesting(false)
				return
			}

			const { tx, rewardCoin } = await farmsSdk.harvest({
				farm: farmId,
				account: accountToUse.objectId,
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

	const unstake = async (amount: string) => {
		const accountToUse = await getAccountWithHighestStake()

		if (!address || !accountToUse) {
			toast.error("No farm account found")
			return
		}

		setIsUnstaking(true)
		try {
			const amountBigInt = parseInputAmount(amount)
			if (amountBigInt <= 0n) {
				toast.error("Invalid unstake amount")
				setIsUnstaking(false)
				return
			}

			if (amountBigInt > accountToUse.stakeBalance) {
				toast.error("Amount exceeds staked balance")
				setIsUnstaking(false)
				return
			}

			const isMaxWithdrawal = amountBigInt === accountToUse.stakeBalance

			const rewards = await farmsSdk.pendingRewards(accountToUse.objectId)
			const rewardsAmount = Number(rewards[0].amount) / Math.pow(10, rewardDecimals)
			const hasRewards = rewardsAmount > 0

			const tx = new Transaction()

			if (hasRewards && isMaxWithdrawal) {
				const { rewardCoin } = await farmsSdk.harvest({
					tx,
					farm: farmId,
					account: accountToUse.objectId,
					rewardType: rewardCoinType,
				})

				tx.transferObjects([rewardCoin], address)
			}

			const { unstakeCoin } = await farmsSdk.unstake({
				tx,
				farm: farmId,
				account: accountToUse.objectId,
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
		unstake,
		isStaking,
		isHarvesting,
		isUnstaking,
	}
}