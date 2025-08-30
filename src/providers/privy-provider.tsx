"use client"

import { ReactNode } from "react"
import { PrivyProvider as PrivyProviderBase, type PrivyProviderProps as PrivyProviderBaseProps } from "@privy-io/react-auth"
import { env } from "@/env"

const privyConfig: PrivyProviderBaseProps["config"] = {
	// @dev: Configure Solana wallet support only
	externalWallets: {
		solana: {},
	},
	// @dev: Disable embedded wallets - we'll create Sui wallets separately
	embeddedWallets: {
		createOnLogin: "off",
	},
	// @dev: Configure login methods - Solana wallet only
	loginMethods: ["wallet"],
	// @dev: Configure appearance
	appearance: {
		theme: "dark",
		accentColor: "#6366f1",
		showWalletLoginFirst: true,
		logo: "/logo.png",
	},
}

interface PrivyProviderProps {
	children: ReactNode
}

export function PrivyProvider({ children }: PrivyProviderProps) {
	return (
		<PrivyProviderBase
			appId={env.NEXT_PUBLIC_PRIVY_APP_ID}
			clientId={env.NEXT_PUBLIC_PRIVY_CLIENT_ID}
			config={privyConfig}
		>
			{children}
		</PrivyProviderBase>
	)
}