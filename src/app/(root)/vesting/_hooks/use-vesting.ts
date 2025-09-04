"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/context/app.context"
import { suiClient } from "@/lib/sui-client"
import { VestingPosition } from "../vesting.utils"
import toast from "react-hot-toast"
import { useVestingSDK } from "./use-vesting-sdk"

export function useVesting() {
	const { address } = useApp()
	const [positions, setPositions] = useState<VestingPosition[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const vestingSdk = useVestingSDK()

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
			const formattedPositions: VestingPosition[] = vestingObjects.map((vesting) => ({
				id: vesting.objectId,
				owner: vesting.owner,
				coinType: vesting.coinType,
				lockedAmount: (vesting.balance + vesting.released).toString(),
				claimedAmount: vesting.released.toString(),
				startTime: Number(vesting.start),
				duration: Number(vesting.duration),
				endTime: Number(vesting.start) + Number(vesting.duration),
			}))

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