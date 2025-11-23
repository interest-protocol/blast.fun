import { useEffect, useState } from "react"
import { useApp } from "@/context/app.context"
import { farmsSdk } from "@/lib/farms"
import { FARMS } from "@interest-protocol/farms"
import { env } from "@/env"
import { Network } from "@/types/network"
import toast from "react-hot-toast"
import type { InterestFarm, InterestAccount } from "@interest-protocol/farms"

interface FarmWithAccount {
	farm: InterestFarm
	account?: InterestAccount
}

export const useFarms = () => {
	const { address, isConnected } = useApp()
	const [farmsWithAccounts, setFarmsWithAccounts] = useState<FarmWithAccount[]>([])
	const [isLoading, setIsLoading] = useState(false)

	const fetchFarmsData = async () => {
		if (!address || !isConnected) return

		setIsLoading(true)
		try {
			const farms = FARMS[env.NEXT_PUBLIC_DEFAULT_NETWORK as Network]
			const farmIds = Object.values(farms).map((farm) => farm.objectId)

			const [farmsData, allAccounts] = await Promise.all([
				Promise.all(farmIds.map((farmId) => farmsSdk.getFarm(farmId))),
				farmsSdk.getAccounts(address),
			])

			const farmsWithAccountsData = farmsData.map((farm) => {
				const account = allAccounts.find((acc) => acc.farm === farm.objectId)
				return { farm, account }
			})

			setFarmsWithAccounts(farmsWithAccountsData)
		} catch (error) {
			console.error("Error fetching farms data:", error)
			toast.error("Failed to fetch farms data")
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		fetchFarmsData()
	}, [address, isConnected])

	return {
		farmsWithAccounts,
		isLoading,
		refetch: fetchFarmsData,
	}
}
