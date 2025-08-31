"use client"

import { ReactNode, useMemo } from "react"
import { PrivyProvider as PrivyProviderBase, type PrivyProviderProps as PrivyProviderBaseProps } from "@privy-io/react-auth"
import { env } from "@/env"

const getPrivyConfig = (): PrivyProviderBaseProps["config"] => {
	return {
		// @dev: Match Nexa's configuration - social logins only
		loginMethods: ["google", "twitter", "discord"],
		// @dev: Disable embedded wallets - Nexa backend creates Sui wallets
		embeddedWallets: {
			createOnLogin: "off",
		},
		// @dev: Configure appearance to match Nexa
		appearance: {
			theme: "dark",
		},
		// @dev: Don't set redirectUrl - let Privy handle it based on current location
		// Nexa's Privy app should have localhost:3000 and production domains whitelisted
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