"use client"

import {
	useAccounts,
	useConnectWallet,
	useCurrentAccount,
	useCurrentWallet,
	useDisconnectWallet,
	useResolveSuiNSName,
	useSwitchAccount,
} from "@mysten/dapp-kit"
import { formatAddress } from "@mysten/sui/utils"
import type { WalletAccount, WalletWithRequiredFeatures } from "@mysten/wallet-standard"
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"

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

	const { mutateAsync: connectMutation, isPending: isConnecting } = useConnectWallet()
	const { mutateAsync: disconnectMutation } = useDisconnectWallet()
	const currentAccount = useCurrentAccount()
	const accounts = useAccounts()
	const { mutate: switchAccountMutation } = useSwitchAccount()
	const { currentWallet } = useCurrentWallet()

	const address = currentAccount?.address || null
	const isConnected = !!currentAccount
	const { data: walletDomain } = useResolveSuiNSName(currentAccount?.label ? null : address)
	const domain = walletDomain || null
	const currentWalletName = currentWallet?.name || null

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

	const disconnect = useCallback(async () => {
		try {
			await disconnectMutation()
		} catch (error) {
			console.error("Failed to disconnect wallet:", error)
			throw error
		}
	}, [disconnectMutation])

	const switchAccount = useCallback(
		async (account: WalletAccount) => {
			try {
				switchAccountMutation({ account })
				toast.success(`Switched to ${account.label || formatAddress(account.address)}...`)
			} catch (error) {
				console.error("Failed to switch account:", error)
				toast.error("Failed to switch account")
				throw error
			}
		},
		[switchAccountMutation]
	)

	// auto close dialog after connection
	useEffect(() => {
		if (isConnected && isConnectDialogOpen) {
			setIsConnectDialogOpen(false)
		}
	}, [isConnected, isConnectDialogOpen])

	const value: AppContextValue = useMemo(
		() => ({
			wallet: currentAccount,
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
		}),
		[
			currentAccount,
			address,
			domain,
			accounts,
			currentWalletName,
			switchAccount,
			isConnected,
			isConnecting,
			isConnectDialogOpen,
			connect,
			disconnect,
		]
	)

	return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
