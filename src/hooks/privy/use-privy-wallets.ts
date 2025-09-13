"use client"

import { useWallets, useSolanaWallets, usePrivy } from "@privy-io/react-auth"
import { useCallback, useEffect, useState } from "react"
import type { ConnectedWallet } from "@privy-io/react-auth"
import toast from "react-hot-toast"

export interface PrivyWallet {
	address: string
	chainType: "solana" | "ethereum"
	walletClientType: string
	isEmbedded: boolean
	connector?: any
}

export interface UsePrivyWalletsReturn {
	wallets: PrivyWallet[]
	solanaWallet?: PrivyWallet
	suiWallet?: PrivyWallet
	activeWallet?: PrivyWallet
	isConnecting: boolean
	connectWallet: () => Promise<void>
	disconnectWallet: (address: string) => Promise<void>
	setActiveWallet: (address: string) => void
	signMessage: (message: string, walletAddress?: string) => Promise<string | undefined>
	createEmbeddedWallet: () => Promise<void>
}

export function usePrivyWallets(): UsePrivyWalletsReturn {
	const { user, createWallet, ready } = usePrivy()
	const { wallets: privyWallets } = useWallets()
	const solanaWallets = useSolanaWallets()
	
	const [wallets, setWallets] = useState<PrivyWallet[]>([])
	const [activeWallet, setActiveWallet] = useState<PrivyWallet>()
	const [isConnecting, setIsConnecting] = useState(false)

	// @dev: Transform Privy wallets to our format
	useEffect(() => {
		const transformedWallets: PrivyWallet[] = []
		
		// @dev: Add Solana wallets
		solanaWallets.wallets.forEach((wallet) => {
			transformedWallets.push({
				address: wallet.address,
				chainType: "solana",
				walletClientType: wallet.walletClientType,
				isEmbedded: wallet.walletClientType === "privy",
				connector: wallet,
			})
		})
		
		// @dev: Add Ethereum/Sui wallets
		privyWallets.forEach((wallet) => {
			// @dev: Check if this is a Sui wallet (embedded)
			const isSuiWallet = wallet.walletClientType === "privy"
			
			transformedWallets.push({
				address: wallet.address,
				chainType: "ethereum", // @dev: Privy embedded wallets are ethereum type
				walletClientType: wallet.walletClientType,
				isEmbedded: wallet.walletClientType === "privy",
				connector: wallet,
			})
		})
		
		setWallets(transformedWallets)
		
		// @dev: Set first wallet as active if none selected
		if (!activeWallet && transformedWallets.length > 0) {
			setActiveWallet(transformedWallets[0])
		}
	}, [privyWallets, solanaWallets.wallets, activeWallet])

	const solanaWallet = wallets.find((w) => w.chainType === "solana")
	const suiWallet = wallets.find((w) => w.isEmbedded && w.chainType === "ethereum")

	const connectWallet = useCallback(async () => {
		setIsConnecting(true)
		try {
			// @dev: For Solana wallets, we rely on Privy's login flow
			toast.success("Please use the connect button to link a wallet")
		} catch (error) {
			console.error("Connect wallet error:", error)
			toast.error("Failed to connect wallet")
		} finally {
			setIsConnecting(false)
		}
	}, [])

	const disconnectWallet = useCallback(async (address: string) => {
		try {
			const wallet = wallets.find((w) => w.address === address)
			if (wallet?.connector?.disconnect) {
				await wallet.connector.disconnect()
			}
			toast.success("Wallet disconnected")
		} catch (error) {
			console.error("Disconnect wallet error:", error)
			toast.error("Failed to disconnect wallet")
		}
	}, [wallets])

	const setActiveWalletByAddress = useCallback((address: string) => {
		const wallet = wallets.find((w) => w.address === address)
		if (wallet) {
			setActiveWallet(wallet)
		}
	}, [wallets])

	const signMessage = useCallback(async (message: string, walletAddress?: string): Promise<string | undefined> => {
		try {
			const wallet = walletAddress 
				? wallets.find((w) => w.address === walletAddress)
				: activeWallet
				
			if (!wallet?.connector) {
				toast.error("No wallet connected")
				return undefined
			}

			if (wallet.chainType === "solana" && wallet.connector.signMessage) {
				const signature = await wallet.connector.signMessage(message)
				return signature
			} else if (wallet.connector.signMessage) {
				const signature = await wallet.connector.signMessage(message)
				return signature
			}
			
			toast.error("Wallet does not support message signing")
			return undefined
		} catch (error) {
			console.error("Sign message error:", error)
			toast.error("Failed to sign message")
			return undefined
		}
	}, [wallets, activeWallet])

	const createEmbeddedWallet = useCallback(async () => {
		if (!ready || !user) {
			toast.error("Please login first")
			return
		}
		
		setIsConnecting(true)
		try {
			// @dev: Create embedded Sui wallet
			const wallet = await createWallet()
			if (wallet) {
				toast.success("Sui wallet created successfully")
			}
		} catch (error) {
			console.error("Create wallet error:", error)
			toast.error("Failed to create embedded wallet")
		} finally {
			setIsConnecting(false)
		}
	}, [createWallet, ready, user])

	return {
		wallets,
		solanaWallet,
		suiWallet,
		activeWallet,
		isConnecting,
		connectWallet,
		disconnectWallet,
		setActiveWallet: setActiveWalletByAddress,
		signMessage,
		createEmbeddedWallet,
	}
}