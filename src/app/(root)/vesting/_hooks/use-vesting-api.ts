"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/context/app.context"
import { VestingApi, type VestingPosition as ApiVestingPosition } from "@/lib/getVesting"
import { VestingPosition } from "../vesting.utils"
import toast from "react-hot-toast"

export function useVestingApi() {
	const { address } = useApp()
	const [positions, setPositions] = useState<VestingPosition[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const fetchVestingPositions = async () => {
		if (!address) {
			setPositions([])
			return
		}

		setIsLoading(true)
		setError(null)
		try {
			const response = await VestingApi.getVestingsByUser(address)
			
			// @dev: Convert API response to our local VestingPosition format
			const formattedPositions: VestingPosition[] = response.data.map((apiPosition: ApiVestingPosition) => {
				const startTime = parseInt(apiPosition.start)
				const duration = parseInt(apiPosition.duration)
				
				return {
					id: apiPosition.objectId,
					owner: apiPosition.owner,
					coinType: apiPosition.coinType,
					lockedAmount: apiPosition.balance,
					claimedAmount: apiPosition.released,
					startTime: startTime,
					duration: duration,
					endTime: startTime + duration,
					claimableAmount: "0" // Will be calculated by utility function
				}
			})

			setPositions(formattedPositions)
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Failed to fetch vesting positions"
			console.error("Error fetching vesting positions:", error)
			setError(errorMessage)
			toast.error("Failed to fetch vesting positions")
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		fetchVestingPositions()
	}, [address])

	return {
		positions,
		isLoading,
		error,
		refetch: fetchVestingPositions,
	}
}