"use client"

import { useCallback, useEffect, useState } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519"
import toast from "react-hot-toast"

const SUI_WALLET_STORAGE_KEY = "privy_sui_wallet"

interface SuiWalletData {
	address: string
	publicKey: string
	privateKey: string // @dev: Encrypted in production
}

export interface UsePrivySuiWalletReturn {
	suiAddress?: string
	suiPublicKey?: string
	createSuiWallet: () => Promise<void>
	getSuiWallet: () => SuiWalletData | null
	clearSuiWallet: () => void
	isCreating: boolean
}

export function usePrivySuiWallet(): UsePrivySuiWalletReturn {
	const { user, authenticated } = usePrivy()
	const [suiAddress, setSuiAddress] = useState<string>()
	const [suiPublicKey, setSuiPublicKey] = useState<string>()
	const [isCreating, setIsCreating] = useState(false)

	// @dev: Load existing Sui wallet from localStorage
	useEffect(() => {
		if (authenticated && user) {
			const storedWallet = localStorage.getItem(SUI_WALLET_STORAGE_KEY)
			if (storedWallet) {
				try {
					const walletData: SuiWalletData = JSON.parse(storedWallet)
					setSuiAddress(walletData.address)
					setSuiPublicKey(walletData.publicKey)
				} catch (error) {
					console.error("Failed to load Sui wallet:", error)
				}
			}
		}
	}, [authenticated, user])

	const createSuiWallet = useCallback(async () => {
		if (!authenticated || !user) {
			toast.error("Please login first")
			return
		}

		setIsCreating(true)
		try {
			// @dev: Generate new Ed25519 keypair for Sui
			const keypair = new Ed25519Keypair()
			const publicKey = keypair.getPublicKey()
			const address = publicKey.toSuiAddress()
			
			// @dev: Get the private key in base64 format directly
			const secretKey = keypair.getSecretKey()
			
			const walletData: SuiWalletData = {
				address,
				publicKey: publicKey.toBase64(),
				privateKey: secretKey, // @dev: Already in base64 format
			}

			// @dev: Store wallet data (encrypt in production)
			localStorage.setItem(SUI_WALLET_STORAGE_KEY, JSON.stringify(walletData))
			
			setSuiAddress(address)
			setSuiPublicKey(walletData.publicKey)
			
			toast.success("Sui wallet created successfully!")
		} catch (error) {
			console.error("Failed to create Sui wallet:", error)
			toast.error("Failed to create Sui wallet")
		} finally {
			setIsCreating(false)
		}
	}, [authenticated, user])

	const getSuiWallet = useCallback((): SuiWalletData | null => {
		const storedWallet = localStorage.getItem(SUI_WALLET_STORAGE_KEY)
		if (storedWallet) {
			try {
				return JSON.parse(storedWallet)
			} catch (error) {
				console.error("Failed to parse Sui wallet:", error)
			}
		}
		return null
	}, [])

	const clearSuiWallet = useCallback(() => {
		localStorage.removeItem(SUI_WALLET_STORAGE_KEY)
		setSuiAddress(undefined)
		setSuiPublicKey(undefined)
		toast.success("Sui wallet cleared")
	}, [])

	return {
		suiAddress,
		suiPublicKey,
		createSuiWallet,
		getSuiWallet,
		clearSuiWallet,
		isCreating,
	}
}