"use client"

import { ReactNode, useMemo } from "react"
import { PrivyProvider as PrivyProviderBase, type PrivyProviderProps as PrivyProviderBaseProps } from "@privy-io/react-auth"
import { env } from "@/env"

const getPrivyConfig = (): PrivyProviderBaseProps["config"] => {
	return {
		// @dev: ONLY Solana wallet connections - no social login, no Ethereum
		// Solana wallets (Phantom, Solflare, etc.) authenticate directly without OAuth redirects
		loginMethods: ["wallet"],
		
		// @dev: Disable embedded wallets - Nexa backend creates Sui wallets
		embeddedWallets: {
			createOnLogin: "off",
		},
		
		// @dev: Configure appearance to match Nexa
		appearance: {
			theme: "dark",
		},
		
		// @dev: Wallet connection config
		// Privy will automatically detect Solana wallets like Phantom
	}
}

interface PrivyProviderProps {
	children: ReactNode
}

export function PrivyProvider({ children }: PrivyProviderProps) {
	const config = useMemo(() => getPrivyConfig(), [])
	
	return (
		<PrivyProviderBase
			appId={env.NEXT_PUBLIC_PRIVY_APP_ID}
			config={config}
		>
			{children}
		</PrivyProviderBase>
	)
}