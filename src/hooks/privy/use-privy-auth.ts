"use client"

import { usePrivy, useSolanaWallets, useLogin } from "@privy-io/react-auth"
import { useEffect, useState, useCallback } from "react"
import toast from "react-hot-toast"

export interface PrivyAuthState {
	isAuthenticated: boolean
	isReady: boolean
	isLoading: boolean
	user: any
	solanaAddress?: string
	solanaPublicKey?: string
	login: () => void
	logout: () => void
	linkWallet: () => void
	unlinkWallet: (address: string) => void
	refreshUser: () => void
}

export function usePrivyAuth(): PrivyAuthState {
	const { 
		ready, 
		authenticated, 
		user, 
		logout: privyLogout,
		linkWallet: privyLinkWallet,
		unlinkWallet: privyUnlinkWallet,
		exportWallet,
	} = usePrivy()
	
	const { login: privyLogin } = useLogin({
		onComplete: ({ user, isNewUser }) => {
			if (isNewUser) {
				toast.success("Welcome to BLAST.FUN!")
			} else {
				toast.success("Welcome back!")
			}
		},
		onError: (error) => {
			console.error("Login error:", error)
			toast.error("Failed to login. Please try again.")
		},
	})
	
	const solanaWallets = useSolanaWallets()
	
	const [isLoading, setIsLoading] = useState(false)
	const [solanaAddress, setSolanaAddress] = useState<string>()
	const [solanaPublicKey, setSolanaPublicKey] = useState<string>()

	// @dev: Extract Solana address and public key from linked accounts
	useEffect(() => {
		if (user?.linkedAccounts) {
			const solanaWallet = user.linkedAccounts.find(
				(account: any) => account.type === "wallet" && account.chainType === "solana"
			)
			if (solanaWallet && 'address' in solanaWallet) {
				setSolanaAddress(solanaWallet.address)
				// @dev: For Solana, the address is the public key
				setSolanaPublicKey(solanaWallet.address)
			}
		}
		
		// @dev: Also check Solana wallets directly
		if (solanaWallets.wallets.length > 0) {
			const primaryWallet = solanaWallets.wallets[0]
			setSolanaAddress(primaryWallet.address)
			// @dev: For Solana wallets, address is the public key
			setSolanaPublicKey(primaryWallet.address)
		}
	}, [user, solanaWallets.wallets])

	const login = useCallback(async () => {
		setIsLoading(true)
		try {
			await privyLogin()
		} finally {
			setIsLoading(false)
		}
	}, [privyLogin])

	const logout = useCallback(async () => {
		setIsLoading(true)
		try {
			await privyLogout()
			setSolanaAddress(undefined)
			setSolanaPublicKey(undefined)
			toast.success("Logged out successfully")
		} finally {
			setIsLoading(false)
		}
	}, [privyLogout])

	const linkWallet = useCallback(async () => {
		setIsLoading(true)
		try {
			await privyLinkWallet()
			toast.success("Wallet linked successfully")
		} catch (error) {
			console.error("Link wallet error:", error)
			toast.error("Failed to link wallet")
		} finally {
			setIsLoading(false)
		}
	}, [privyLinkWallet])

	const unlinkWallet = useCallback(async (address: string) => {
		setIsLoading(true)
		try {
			await privyUnlinkWallet(address)
			toast.success("Wallet unlinked successfully")
		} catch (error) {
			console.error("Unlink wallet error:", error)
			toast.error("Failed to unlink wallet")
		} finally {
			setIsLoading(false)
		}
	}, [privyUnlinkWallet])

	const refreshUser = useCallback(() => {
		// @dev: Privy automatically refreshes user data
		// This is a placeholder for manual refresh if needed
	}, [])

	return {
		isAuthenticated: authenticated,
		isReady: ready,
		isLoading,
		user,
		solanaAddress,
		solanaPublicKey,
		login,
		logout,
		linkWallet,
		unlinkWallet,
		refreshUser,
	}
}