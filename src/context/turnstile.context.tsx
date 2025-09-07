"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"

interface TurnstileContextType {
	token: string | null
	setToken: (token: string | null) => void
	resetToken: () => void
	refreshToken: () => void
	refreshTrigger: number
	isRequired: boolean
	setIsRequired: (required: boolean) => void
}

const TurnstileContext = createContext<TurnstileContextType | undefined>(undefined)

export function TurnstileProvider({ children }: { children: ReactNode }) {
	const [token, setTokenState] = useState<string | null>(null)
	const [isRequired, setIsRequired] = useState(false)
	const [refreshTrigger, setRefreshTrigger] = useState(0)

	const setToken = useCallback((newToken: string | null) => {
		setTokenState(newToken)
	}, [])

	const resetToken = useCallback(() => {
		setTokenState(null)
	}, [])

	const refreshToken = useCallback(() => {
		setTokenState(null)
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