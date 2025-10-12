"use client"

import { useConnectWallet, useResolveSuiNSName, useAccounts, useSwitchAccount, useCurrentWallet, useCurrentAccount, useSignAndExecuteTransaction, useDisconnectWallet } from "@mysten/dapp-kit"
import { formatAddress } from "@mysten/sui/utils"
import type { WalletAccount, WalletWithRequiredFeatures } from "@mysten/wallet-standard"
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { Transaction } from "@mysten/sui/transactions"
import { usePrivyAuth } from "@/hooks/privy/use-privy-auth"
import { usePrivySuiWallet } from "@/hooks/privy/use-privy-sui-wallet"
import { usePrivySuiTransaction } from "@/hooks/privy/use-privy-sui-transaction"

export type WalletType = "standard" | "privy"

// @dev: Store the active wallet type preference
const ACTIVE_WALLET_KEY = "active_wallet_type"

interface AppContextValue {
	wallet: WalletAccount | null
	address: string | null
	domain: string | null
	
	// Multi-wallet support
	accounts: readonly WalletAccount[]
	currentAccount: WalletAccount | null
	currentWalletName: string | null
	switchAccount: (account: WalletAccount) => Promise<void>

	isConnected: boolean
	isConnecting: boolean

	isConnectDialogOpen: boolean
	setIsConnectDialogOpen: (open: boolean) => void

	connect: (wallet: WalletWithRequiredFeatures) => Promise<void>
	disconnect: () => Promise<void>
	
	// @dev: Unified wallet state
	walletType: WalletType | null
	switchToWallet: (type: WalletType) => void
	hasStandardWallet: boolean
	hasPrivyWallet: boolean
	signAndExecuteTransaction: (tx: Transaction) => Promise<any>
}

const AppContext = createContext<AppContextValue | null>(null)

export function useApp() {
	const appContext = useContext(AppContext)

	if (!appContext) {
		throw new Error("useApp must be used within AppProvider")
	}

	return appContext
}

export function AppContextProvider({ children }: { children: ReactNode }) {
	const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false)
	const [activeWalletType, setActiveWalletType] = useState<WalletType | null>(null)

	// @dev: Standard wallet hooks
	const standardAccount = useCurrentAccount()
	const { mutateAsync: standardSignAndExecute } = useSignAndExecuteTransaction()
	const { mutateAsync: standardDisconnect } = useDisconnectWallet()
	const { mutateAsync: connectMutation, isPending: isConnecting } = useConnectWallet()
	const accounts = useAccounts()
	const { mutate: switchAccountMutation } = useSwitchAccount()
	const { currentWallet } = useCurrentWallet()
	
	// @dev: Privy wallet hooks
	const { isAuthenticated: isPrivyAuthenticated, logout: privyLogout } = usePrivyAuth()
	const { suiAddress: privySuiAddress } = usePrivySuiWallet()
	const { signAndExecuteTransaction: privySignAndExecute } = usePrivySuiTransaction()
	
	// @dev: Check which wallets are available
	const hasStandardWallet = !!standardAccount
	const hasPrivyWallet = isPrivyAuthenticated && !!privySuiAddress
	
	// @dev: Load saved preference on mount
	useEffect(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem(ACTIVE_WALLET_KEY) as WalletType | null
			
			// If we have a saved preference and that wallet is available, use it
			if (saved === "standard" && hasStandardWallet) {
				setActiveWalletType("standard")
			} else if (saved === "privy" && hasPrivyWallet) {
				setActiveWalletType("privy")
			} 
			// If no saved preference or saved wallet not available, set default
			else if (!activeWalletType) {
				if (hasStandardWallet) {
					setActiveWalletType("standard")
				} else if (hasPrivyWallet) {
					setActiveWalletType("privy")
				}
			}
		}
	}, [hasStandardWallet, hasPrivyWallet, activeWalletType])
	
	// @dev: Determine active wallet type based on user preference
	const walletType = useMemo<WalletType | null>(() => {
		// If both wallets are available, use the active preference
		if (hasStandardWallet && hasPrivyWallet) {
			// User has explicitly chosen one
			if (activeWalletType === "standard" || activeWalletType === "privy") {
				return activeWalletType
			}
			// Default to standard if no preference set
			return "standard"
		}
		
		// If only one wallet is available, use it
		if (hasStandardWallet) return "standard"
		if (hasPrivyWallet) return "privy"
		
		return null
	}, [activeWalletType, hasStandardWallet, hasPrivyWallet])
	
	const isConnected = walletType !== null
	
	// @dev: Get current address based on active wallet type
	const address = useMemo(() => {
		if (walletType === "standard") return standardAccount?.address || null
		if (walletType === "privy") return privySuiAddress || null
		return null
	}, [walletType, standardAccount, privySuiAddress])
	
	// @dev: Only use standard account for wallet management, not for active address
	const currentAccount = accounts[0] || null
	
	// @dev: Resolve domain for the active address
	const { data: walletDomain } = useResolveSuiNSName(address)
	const domain = walletDomain || null
	const currentWalletName = walletType === "privy" ? "Quick Account" : (currentWallet?.name || null)

	const connect = useCallback(
		async (wallet: WalletWithRequiredFeatures) => {
			try {
				await connectMutation({ wallet })
			} catch (error) {
				console.error("Failed to connect wallet:", error)
				toast.error(`Failed to connect to ${wallet.name}`)
				throw error
			}
		},
		[connectMutation]
	)

	// @dev: Unified sign and execute transaction
	const signAndExecuteTransaction = useCallback(async (tx: Transaction) => {
		if (!walletType) {
			toast.error("No wallet connected")
			throw new Error("No wallet connected")
		}
		
		try {
			if (walletType === "standard") {
				// @dev: Use standard wallet signing
				// Note: dapp-kit's signAndExecuteTransaction doesn't support options parameter
				// The wallet should return the full transaction response by default
				const result = await standardSignAndExecute({
					transaction: tx as any,
				})
				return result
			} else if (walletType === "privy") {
				// @dev: Use Privy wallet signing (includes options)
				const result = await privySignAndExecute(tx)
				return result
			}
		} catch (error) {
			console.error("Transaction failed:", error)
			throw error
		}
	}, [walletType, standardSignAndExecute, privySignAndExecute])
	
	// @dev: Unified disconnect
	const disconnect = useCallback(async () => {
		try {
			if (walletType === "privy") {
				privyLogout()
			} else if (walletType === "standard") {
				// @dev: Disconnect standard wallet
				await standardDisconnect()
			}
		} catch (error) {
			console.error("Failed to disconnect wallet:", error)
			throw error
		}
	}, [walletType, privyLogout, standardDisconnect])
	
	// @dev: Switch between wallets
	const switchToWallet = useCallback((type: WalletType) => {
		if ((type === "standard" && hasStandardWallet) || (type === "privy" && hasPrivyWallet)) {
			setActiveWalletType(type)
			localStorage.setItem(ACTIVE_WALLET_KEY, type)
			toast.success(`Switched to ${type === "privy" ? "Quick Account" : "Standard Wallet"}`)
		}
	}, [hasStandardWallet, hasPrivyWallet])

	const switchAccount = useCallback(async (account: WalletAccount) => {
		try {
			switchAccountMutation({ account })
			toast.success(`Switched to ${account.label || formatAddress(account.address)}...`)
		} catch (error) {
			console.error("Failed to switch account:", error)
			toast.error("Failed to switch account")
			throw error
		}
	}, [switchAccountMutation])

	// auto close dialog after connection
	useEffect(() => {
		if (isConnected && isConnectDialogOpen) {
			setIsConnectDialogOpen(false)
		}
	}, [isConnected, isConnectDialogOpen])

	const value: AppContextValue = useMemo(
		() => ({
			// @dev: wallet is for display purposes - shows active wallet info
			wallet: walletType === "privy" ? { address: address || "", label: "Quick Account" } as WalletAccount : currentAccount,
			address,
			domain,
			
			// Multi-wallet support
			accounts,
			currentAccount,
			currentWalletName,
			switchAccount,

			isConnected,
			isConnecting,

			isConnectDialogOpen,
			setIsConnectDialogOpen,

			connect,
			disconnect,
			
			// @dev: Unified wallet state
			walletType,
			switchToWallet,
			hasStandardWallet,
			hasPrivyWallet,
			signAndExecuteTransaction,
		}),
		[walletType, currentAccount, address, domain, accounts, currentWalletName, switchAccount, isConnected, isConnecting, isConnectDialogOpen, connect, disconnect, switchToWallet, hasStandardWallet, hasPrivyWallet, signAndExecuteTransaction]
	)

	return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
