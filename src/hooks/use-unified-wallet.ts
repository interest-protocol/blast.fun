"use client"

import { useApp } from "@/context/app.context"

export type { WalletType } from "@/context/app.context"

export interface UnifiedWalletState {
	// @dev: Connection state
	isConnected: boolean
	walletType: ReturnType<typeof useApp>["walletType"]
	
	// @dev: Account information
	address: string | undefined
	
	// @dev: Actions
	signAndExecuteTransaction: ReturnType<typeof useApp>["signAndExecuteTransaction"]
	disconnect: () => Promise<void>
	switchToWallet: ReturnType<typeof useApp>["switchToWallet"]
	
	// @dev: Available wallets
	hasStandardWallet: boolean
	hasPrivyWallet: boolean
}

// @dev: Use unified wallet from AppContext - now just a thin wrapper
export function useUnifiedWallet(): UnifiedWalletState {
	const {
		isConnected,
		walletType,
		address,
		signAndExecuteTransaction,
		disconnect,
		switchToWallet,
		hasStandardWallet,
		hasPrivyWallet,
	} = useApp()
	
	return {
		isConnected,
		walletType,
		address: address || undefined,
		signAndExecuteTransaction,
		disconnect,
		switchToWallet,
		hasStandardWallet,
		hasPrivyWallet,
	}
}