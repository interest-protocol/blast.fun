"use client"

import { useState, useEffect, useCallback } from "react"
import { useApp } from "@/context/app.context"
import toast from "react-hot-toast"
import { migratorSdk } from "@/lib/pump"
import { useTransaction } from "@/hooks/sui/use-transaction"
import { playSound } from "@/lib/audio"
import { interestProtocolApi } from "@/lib/interest-protocol-api"

export interface CreatorReward {
	id: string
	memeCoinType: string
	memeCoinName?: string
	memeCoinSymbol?: string
	blueFinPoolId: string
	blueFinPositionId: string
	objectId: string
	estimatedRewards?: string
	claimed?: boolean
}

export function useCreatorRewards() {
	const { address } = useApp()
	const { executeTransaction } = useTransaction()

	const [rewards, setRewards] = useState<CreatorReward[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [isClaiming, setIsClaiming] = useState<string | null>(null)

	const fetchRewards = useCallback(async () => {
		if (!address) return

		setIsLoading(true)
		setError(null)

		try {
			const res = await migratorSdk.getPositions({ owner: address })

			if (!res || !res.positions || res.positions.length === 0) {
				setRewards([])
				return
			}

			// @dev: Fetch pending fees for each position and map to creator rewards format
			const rewardsList: CreatorReward[] = await Promise.all(
				res.positions.map(async (p) => {
					let estimatedRewards = "0"
					let memeCoinName: string | undefined
					let memeCoinSymbol: string | undefined

					try {
						// @dev: Fetch pending fee for this position
						const pendingFeeResult = await migratorSdk.pendingFee({
							bluefinPool: p.blueFinPoolId,
							memeCoinType: p.memeCoinType,
							positionOwner: p.objectId,
						})

						if (pendingFeeResult && pendingFeeResult.amount) {
							estimatedRewards = pendingFeeResult.amount
						}

						// @dev: Fetch coin metadata
						const metadata = await interestProtocolApi.getCoinMetadata(p.memeCoinType)
						if (metadata) {
							memeCoinName = metadata.name
							memeCoinSymbol = metadata.symbol
						}
					} catch (err) {
						console.error(`Error fetching data for position ${p.objectId}:`, err)
					}

					return {
						id: p.objectId,
						memeCoinType: p.memeCoinType,
						memeCoinName,
						memeCoinSymbol,
						blueFinPoolId: p.blueFinPoolId,
						blueFinPositionId: p.blueFinPositionId,
						objectId: p.objectId,
						estimatedRewards,
						claimed: false
					}
				})
			)

			setRewards(rewardsList)
		} catch (err) {
			console.error("Error fetching creator rewards:", err)
			setError("Failed to fetch creator rewards")
			toast.error("Failed to fetch creator rewards")
		} finally {
			setIsLoading(false)
		}
	}, [address])

	const claimReward = useCallback(async (rewardId: string) => {
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
			// @dev: Create PTB for claiming rewards
			console.log("reward", reward)

			const { tx, suiCoin } = migratorSdk.collectFee({
				bluefinPool: reward.blueFinPoolId,
				memeCoinType: reward.memeCoinType,
				positionOwner: reward.objectId,
			})

			tx.transferObjects([suiCoin], tx.pure.address(address))

			const result = await executeTransaction(tx)

			if (result) {
				toast.success("Successfully claimed rewards!")

				// @dev: Play success sound
				playSound('buy')

				// @dev: Update rewards list
				await fetchRewards()

				return true
			} else {
				toast.error("Failed to claim rewards")
				return false
			}
		} catch (err) {
			console.error("Error claiming reward:", err)
			toast.error("Failed to claim rewards")
			return false
		} finally {
			setIsClaiming(null)
		}
	}, [address, rewards, executeTransaction, fetchRewards])

	const claimAllRewards = useCallback(async () => {
		if (!address) {
			toast.error("Please connect your wallet")
			return false
		}

		if (rewards.length === 0) {
			toast.error("No rewards to claim")
			return false
		}

		let successCount = 0
		let failCount = 0

		for (const reward of rewards) {
			if (!reward.claimed) {
				const success = await claimReward(reward.id)
				if (success) {
					successCount++
				} else {
					failCount++
				}
			}
		}

		if (successCount > 0) {
			toast.success(`Successfully claimed ${successCount} reward(s)`)
		}
		if (failCount > 0) {
			toast.error(`Failed to claim ${failCount} reward(s)`)
		}

		return successCount > 0
	}, [address, rewards, claimReward])

	useEffect(() => {
		if (address) {
			fetchRewards()
		} else {
			setRewards([])
		}
	}, [address, fetchRewards])

	return {
		rewards,
		isLoading,
		error,
		isClaiming,
		claimReward,
		claimAllRewards,
		refetch: fetchRewards,
	}
}