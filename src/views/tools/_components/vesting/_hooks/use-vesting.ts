"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/context/app.context"
import { suiClient } from "@/lib/sui-client"
import { VestingPosition } from "../vesting.utils"
import toast from "react-hot-toast"
import { vestingSdk } from "@/lib/memez/sdk"

export function useVesting() {
	const { address } = useApp()
	const [positions, setPositions] = useState<VestingPosition[]>([])
	const [isLoading, setIsLoading] = useState(false)

	const fetchVestingPositions = async () => {
		if (!address) return

		setIsLoading(true)
		try {
			// @dev: Query all vesting objects owned by the user
			// The vesting type pattern is {package}::memez_soulbound_vesting::Vesting<T>
			const vestingPackage = "0xc0e8906f5e0dd114d5de1da7cda2ce7d58763b8d9da3af839fbe25e8c106d317"
			
			const ownedObjects = await suiClient.getOwnedObjects({
				owner: address,
				filter: {
					StructType: `${vestingPackage}::memez_soulbound_vesting::Vesting`,
				},
				options: {
					showContent: true,
					showType: true,
				},
			})

			if (ownedObjects.data.length === 0) {
				setPositions([])
				return
			}

			// @dev: Parse vesting objects using SDK
			const vestingIds = ownedObjects.data.map(obj => obj.data?.objectId).filter(Boolean) as string[]
			const vestingObjects = await vestingSdk.getMultiple(vestingIds)

			// @dev: Convert to our VestingPosition format
			const formattedPositions: VestingPosition[] = vestingObjects.map((vesting) => {
				const currentTime = Date.now()
				const startTime = Number(vesting.start)
				const duration = Number(vesting.duration)
				const endTime = startTime + duration
				const elapsed = Math.max(0, Math.min(currentTime - startTime, duration))
				
				// @dev: Convert bigint to number for calculations, then back to bigint
				const totalAmount = vesting.balance + vesting.released
				const vestedAmount = (totalAmount * BigInt(elapsed)) / BigInt(duration)
				const claimableAmount = vestedAmount > vesting.released 
					? vestedAmount - vesting.released 
					: BigInt(0)
				
				return {
					id: vesting.objectId,
					owner: vesting.owner,
					coinType: vesting.coinType,
					lockedAmount: totalAmount.toString(),
					claimedAmount: vesting.released.toString(),
					claimableAmount: claimableAmount.toString(),
					startTime,
					duration,
					endTime,
					isDestroyed: false // @dev: Active vesting positions are not destroyed
				}
			})

			setPositions(formattedPositions)
		} catch (error) {
			console.error("Error fetching vesting positions:", error)
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
		refetch: fetchVestingPositions,
	}
}