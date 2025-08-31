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

// @dev: Cache keys for storing wallet data
const PRIVY_WALLET_CACHE_KEY = "privy_sui_wallet_cache"

export function usePrivySuiWallet(): UsePrivySuiWalletReturn {
	const { authenticated, getAccessToken } = usePrivy()
	
	// @dev: Initialize from cache if available
	const getCachedWallet = () => {
		if (typeof window === "undefined") return { address: undefined, publicKey: undefined }
		try {
			const cached = localStorage.getItem(PRIVY_WALLET_CACHE_KEY)
			if (cached) {
				const data = JSON.parse(cached)
				return { address: data.address, publicKey: data.publicKey }
			}
		} catch (error) {
			console.error("Failed to load cached wallet:", error)
		}
		return { address: undefined, publicKey: undefined }
	}
	
	const cachedWallet = getCachedWallet()
	const [suiAddress, setSuiAddress] = useState<string | undefined>(cachedWallet.address)
	const [suiPublicKey, setSuiPublicKey] = useState<string | undefined>(cachedWallet.publicKey)
	const [isCreating, setIsCreating] = useState(false)
	const [isLoading, setIsLoading] = useState(false)

	// @dev: Helper to cache wallet data
	const cacheWallet = useCallback((address: string, publicKey: string) => {
		if (typeof window !== "undefined") {
			try {
				localStorage.setItem(PRIVY_WALLET_CACHE_KEY, JSON.stringify({ address, publicKey }))
			} catch (error) {
				console.error("Failed to cache wallet:", error)
			}
		}
	}, [])
	
	// @dev: Fetch wallet from Nexa backend on mount
	useEffect(() => {
		const fetchWallet = async () => {
			if (authenticated) {
				// @dev: If we have cached data and not loading, use it immediately
				if (cachedWallet.address && !isLoading) {
					return
				}
				
				setIsLoading(true)
				try {
					const accessToken = await getAccessToken()
					if (accessToken) {
						const response = await PrivyApiService.createOrGetUserWallet(accessToken)
						if (response.data) {
							setSuiAddress(response.data.address)
							setSuiPublicKey(response.data.publicKey)
							// @dev: Cache the wallet data
							cacheWallet(response.data.address, response.data.publicKey)
						}
					}
				} catch (error) {
					console.error("Failed to fetch Sui wallet:", error)
				} finally {
					setIsLoading(false)
				}
			} else {
				// @dev: Clear cache when not authenticated
				if (typeof window !== "undefined") {
					localStorage.removeItem(PRIVY_WALLET_CACHE_KEY)
				}
				setSuiAddress(undefined)
				setSuiPublicKey(undefined)
			}
		}
		fetchWallet()
		// eslint-disable-next-line react-hooks/exhaustive-deps
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
				// @dev: Cache the wallet data
				cacheWallet(response.data.address, response.data.publicKey)
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
		// @dev: Clear local state and cache, wallet remains on server
		setSuiAddress(undefined)
		setSuiPublicKey(undefined)
		if (typeof window !== "undefined") {
			localStorage.removeItem(PRIVY_WALLET_CACHE_KEY)
		}
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