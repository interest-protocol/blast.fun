"use client"

import { ReactNode } from "react"
import { PrivyProvider as PrivyProviderBase, type PrivyProviderProps as PrivyProviderBaseProps } from "@privy-io/react-auth"
import { env } from "@/env"

const privyConfig: PrivyProviderBaseProps["config"] = {
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
}

interface PrivyProviderProps {
	children: ReactNode
}

export function PrivyProvider({ children }: PrivyProviderProps) {
	return (
		<PrivyProviderBase
			appId={env.NEXT_PUBLIC_PRIVY_APP_ID}
			config={privyConfig}
		>
			{children}
		</PrivyProviderBase>
	)
}