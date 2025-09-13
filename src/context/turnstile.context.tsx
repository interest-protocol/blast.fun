"use client"

import { SLUSH_WALLET_BYPASS_TOKEN, isSlushWalletBrowser } from "@/lib/slush-wallet-detector"
import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from "react"

interface TurnstileContextType {
	token: string | null
	setToken: (token: string | null) => void
	resetToken: () => void
	refreshToken: () => void
	refreshTrigger: number
	isRequired: boolean
	setIsRequired: (required: boolean) => void
	isSlushWallet: boolean
}

const TurnstileContext = createContext<TurnstileContextType | undefined>(undefined)

export function TurnstileProvider({ children }: { children: ReactNode }) {
	const [token, setTokenState] = useState<string | null>(null)
	const [isRequired, setIsRequired] = useState(false)
	const [refreshTrigger, setRefreshTrigger] = useState(0)
	const [isSlushWallet, setIsSlushWallet] = useState(false)

	// @dev: Detect Slush wallet on mount and set bypass token if needed
	useEffect(() => {
		const isSlush = isSlushWalletBrowser()
		setIsSlushWallet(isSlush)
		
		// @dev: Auto-set bypass token for Slush wallet users
		if (isSlush) {
			setTokenState(SLUSH_WALLET_BYPASS_TOKEN)
		}
	}, [])

	const setToken = useCallback((newToken: string | null) => {
		// @dev: Don't override bypass token for Slush wallet
		if (isSlushWalletBrowser()) {
			setTokenState(SLUSH_WALLET_BYPASS_TOKEN)
		} else {
			setTokenState(newToken)
		}
	}, [])

	const resetToken = useCallback(() => {
		// @dev: Keep bypass token for Slush wallet
		if (isSlushWalletBrowser()) {
			setTokenState(SLUSH_WALLET_BYPASS_TOKEN)
		} else {
			setTokenState(null)
		}
	}, [])

	const refreshToken = useCallback(() => {
		// @dev: Keep bypass token for Slush wallet
		if (isSlushWalletBrowser()) {
			setTokenState(SLUSH_WALLET_BYPASS_TOKEN)
		} else {
			setTokenState(null)
		}
		setRefreshTrigger(prev => prev + 1)
	}, [])

	return (
		<TurnstileContext.Provider
			value={{
				token,
				setToken,
				resetToken,
				refreshToken,
				refreshTrigger,
				isRequired,
				setIsRequired,
				isSlushWallet,
			}}
		>
			{children}
		</TurnstileContext.Provider>
	)
}

export function useTurnstile() {
	const context = useContext(TurnstileContext)
	if (context === undefined) {
		throw new Error("useTurnstile must be used within a TurnstileProvider")
	}
	return context
}