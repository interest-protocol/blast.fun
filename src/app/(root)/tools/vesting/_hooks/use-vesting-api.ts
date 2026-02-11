"use client"

import { useCallback, useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { useApp } from "@/context/app.context"
import { VestingApi, type VestingPosition as ApiVestingPosition, type CoinMetadata } from "@/lib/getVesting"
import { VestingPosition } from "../vesting.utils"
import { vestingSdk } from "@/lib/memez/sdk"

export function useVestingApi() {
	const { address } = useApp()
	const [allPositions, setAllPositions] = useState<VestingPosition[]>([])
	const [hasMore, setHasMore] = useState(true)
	const [isLoadingMore, setIsLoadingMore] = useState(false)

	const fetchPositionsPage = useCallback(async (offset: number): Promise<VestingPosition[]> => {
		if (!address) return []

		try {
			const limit = 20
			const response = await VestingApi.getVestingsByUser(address, { 
				limit, 
				offset 
			})
			
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
					claimableAmount: "0", // Will be calculated below
					isDestroyed: apiPosition.isDestroyed,
				}
			})

			// @dev: Calculate claimable amounts for all positions using Promise.all
			const claimablePromises = formattedPositions.map(async (position) => {
				try {
					const claimable = await vestingSdk.calculateClaimable(position.id)
					return { id: position.id, claimableAmount: claimable.toString() }
				} catch (error) {
					console.error(`Failed to calculate claimable amount for position ${position.id}:`, error)
					return { id: position.id, claimableAmount: "0" }
				}
			})

			// Run claimablePromises and metadata fetch in parallel
			const uniqueCoinTypes = [...new Set(formattedPositions.map(p => p.coinType))]
			const [claimableResults, metadataResults] = await Promise.all([
				Promise.all(claimablePromises),
				VestingApi.getCoinMetadata(uniqueCoinTypes)
			])
			const decimalsMap: Record<string, number> = {}
			metadataResults.filter((m): m is CoinMetadata => m != null).forEach((metadata) => {
				decimalsMap[metadata.type] = metadata.decimals
			})
			
			// @dev: Update positions with calculated claimable amounts using correct decimals
			const positionsWithClaimable = formattedPositions.map(position => {
				const claimableData = claimableResults.find(result => result.id === position.id)
				const decimals = decimalsMap[position.coinType] || 9 // fallback to 9 if not found
				return {
					...position,
					claimableAmount: (parseFloat(claimableData?.claimableAmount || "0") / 10 ** decimals).toFixed(decimals > 6 ? 6 : decimals).toString()
				}
			})

			// @dev: Update hasMore based on response
			setHasMore(response.data.length === limit) // If we got less than limit, no more pages

			return positionsWithClaimable
		} catch (error) {
			console.error("Error fetching vesting positions:", error)
			toast.error("Failed to fetch vesting positions")
			throw error
		}
	}, [address, vestingSdk])

	const {
		data: initialPositions = [],
		isLoading,
		error,
		refetch: refetchInitial,
	} = useQuery({
		queryKey: ["vesting-positions-initial", address],
		queryFn: () => fetchPositionsPage(0),
		enabled: !!address,
		staleTime: 10000, // 10 seconds
		refetchInterval: 30000, // Auto-refetch every 30 seconds
	})

	// @dev: Update allPositions when initialPositions changes
	useEffect(() => {
		if (initialPositions.length > 0) {
			setAllPositions(initialPositions)
		}
	}, [initialPositions])

	const loadMore = useCallback(async () => {
		if (!hasMore || isLoadingMore) return

		setIsLoadingMore(true)
		try {
			const nextPage = await fetchPositionsPage(allPositions.length)
			setAllPositions(prev => [...prev, ...nextPage])
		} catch (error) {
			console.error("Error loading more positions:", error)
			toast.error("Failed to load more positions")
		} finally {
			setIsLoadingMore(false)
		}
	}, [fetchPositionsPage, hasMore, isLoadingMore, allPositions.length])

	const refetch = useCallback(async () => {
		setAllPositions([])
		setHasMore(true)
		await refetchInitial()
	}, [refetchInitial])

	return {
		positions: allPositions.length > 0 ? allPositions : initialPositions,
		isLoading,
		error,
		refetch,
		loadMore,
		hasMore,
		isLoadingMore,
	}
}