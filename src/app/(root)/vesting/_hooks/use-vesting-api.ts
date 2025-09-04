"use client"

import { useQuery } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { useApp } from "@/context/app.context"
import { VestingApi, type VestingPosition as ApiVestingPosition } from "@/lib/getVesting"
import { VestingPosition } from "../vesting.utils"

export function useVestingApi() {
	const { address } = useApp()

	const {
		data: positions = [],
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["vesting-positions", address],
		queryFn: async (): Promise<VestingPosition[]> => {
			if (!address) {
				return []
			}

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

				return formattedPositions
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : "Failed to fetch vesting positions"
				console.error("Error fetching vesting positions:", error)
				toast.error("Failed to fetch vesting positions")
				throw error
			}
		},
		enabled: !!address,
		staleTime: 10000, // 10 seconds
		refetchInterval: 30000, // Auto-refetch every 30 seconds
	})

	return {
		positions,
		isLoading,
		error,
		refetch,
	}
}