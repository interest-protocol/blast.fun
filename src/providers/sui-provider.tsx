"use client"

import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode } from "react"
import { AppContextProvider } from "@/context/app.context"
import { env } from "@/env"
import useNetworkConfig from "@/hooks/use-network-config"
import { Network } from "@/types/network"

import "@mysten/dapp-kit/dist/index.css"

const queryClient = new QueryClient()

export default function SuiProvider({ children }: { children: ReactNode }) {
	const { networkConfig } = useNetworkConfig()

	return (
		<QueryClientProvider client={queryClient}>
			<SuiClientProvider networks={networkConfig} defaultNetwork={env.NEXT_PUBLIC_DEFAULT_NETWORK as Network}>
				<WalletProvider autoConnect slushWallet={{ name: "BLAST.FUN" }}>
					<AppContextProvider>{children}</AppContextProvider>
				</WalletProvider>
			</SuiClientProvider>
		</QueryClientProvider>
	)
}
