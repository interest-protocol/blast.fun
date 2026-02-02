import { useEffect, useState, useRef } from "react"
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
  const abortControllerRef = useRef<AbortController | null>(null)
  const isMountedRef = useRef(true)

  const fetchFarmsData = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    setIsLoading(true)

    try {
      const farms = FARMS[env.NEXT_PUBLIC_DEFAULT_NETWORK as Network]
      const farmIds = Object.values(farms).map((farm) => farm.objectId)

      const farmsData = await Promise.all(
        farmIds.map((farmId) => farmsSdk.getFarm(farmId))
      )

      if (!isMountedRef.current) return

      let farmsWithAccountsData = farmsData.map((farm) => ({
        farm,
        account: undefined as InterestAccount | undefined,
      }))

      if (address && isConnected) {
        const allAccounts = await farmsSdk.getAccounts(address)

        if (!isMountedRef.current) return

        farmsWithAccountsData = farmsData.map((farm) => {
          const farmAccounts = allAccounts.filter((acc) => acc.farm === farm.objectId)

          const primaryAccount = farmAccounts.sort((a, b) =>
            Number(b.stakeBalance - a.stakeBalance)
          )[0]

          return { farm, account: primaryAccount }
        })
      }

      if (isMountedRef.current) {
        setFarmsWithAccounts(farmsWithAccountsData)
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Error fetching farms data:", error)
        if (isMountedRef.current) {
          toast.error("Failed to fetch farms data")
        }
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    isMountedRef.current = true
    fetchFarmsData()

    return () => {
      isMountedRef.current = false
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [address, isConnected])

  return {
    farmsWithAccounts,
    isLoading,
    refetch: fetchFarmsData,
  }
}