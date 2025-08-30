"use client"

import { useCallback, useEffect, useState } from "react"
import { usePrivy } from "@privy-io/react-auth"
import toast from "react-hot-toast"
import PrivyApiService from "@/services/privy-api.service"

export interface UsePrivySuiWalletReturn {
	suiAddress?: string
	suiPublicKey?: string
	createSuiWallet: () => Promise<void>
	clearSuiWallet: () => void
	isCreating: boolean
	isLoading: boolean
}

export function usePrivySuiWallet(): UsePrivySuiWalletReturn {
	const { authenticated, getAccessToken } = usePrivy()
	const [suiAddress, setSuiAddress] = useState<string>()
	const [suiPublicKey, setSuiPublicKey] = useState<string>()
	const [isCreating, setIsCreating] = useState(false)
	const [isLoading, setIsLoading] = useState(false)

	// @dev: Fetch wallet from Nexa backend on mount
	useEffect(() => {
		const fetchWallet = async () => {
			if (authenticated) {
				setIsLoading(true)
				try {
					const accessToken = await getAccessToken()
					if (accessToken) {
						const response = await PrivyApiService.createOrGetUserWallet(accessToken)
						if (response.data) {
							setSuiAddress(response.data.address)
							setSuiPublicKey(response.data.publicKey)
						}
					}
				} catch (error) {
					console.error("Failed to fetch Sui wallet:", error)
				} finally {
					setIsLoading(false)
				}
			}
		}
		fetchWallet()
	}, [authenticated, getAccessToken])

	const createSuiWallet = useCallback(async () => {
		if (!authenticated) {
			toast.error("Please login first")
			return
		}

		setIsCreating(true)
		try {
			const accessToken = await getAccessToken()
			if (!accessToken) {
				throw new Error("No access token available")
			}

			// @dev: Create or get wallet from Nexa backend
			const response = await PrivyApiService.createOrGetUserWallet(accessToken)
			if (response.data) {
				setSuiAddress(response.data.address)
				setSuiPublicKey(response.data.publicKey)
				toast.success("Sui wallet ready!")
				console.log("Sui Wallet:", {
					address: response.data.address,
					publicKey: response.data.publicKey,
				})
			}
		} catch (error) {
			console.error("Failed to create/get Sui wallet:", error)
			toast.error("Failed to setup Sui wallet")
		} finally {
			setIsCreating(false)
		}
	}, [authenticated, getAccessToken])

	const clearSuiWallet = useCallback(() => {
		// @dev: Clear local state only, wallet remains on server
		setSuiAddress(undefined)
		setSuiPublicKey(undefined)
		toast.success("Sui wallet disconnected")
	}, [])

	return {
		suiAddress,
		suiPublicKey,
		createSuiWallet,
		clearSuiWallet,
		isCreating,
		isLoading,
	}
}