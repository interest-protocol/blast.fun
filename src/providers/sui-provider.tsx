"use client"

import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit"
import type { SuiJsonRpcClient } from "@mysten/sui/jsonRpc"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode } from "react"
import { AppContextProvider } from "@/context/app.context"
import { env } from "@/env"
import useNetworkConfig from "@/hooks/use-network-config"
import { suiGrpcClient } from "@/lib/sui-grpc"
import { Network } from "@/types/network"

import "@mysten/dapp-kit/dist/index.css"

const queryClient = new QueryClient()

// @dev: dapp-kit defaults to a JSON-RPC client, which public fullnodes no longer serve; hand it the gRPC client
// so wallet hooks resolve intents (coinWithBalance, etc.) over gRPC. dapp-kit 1.0 still types this as JSON-RPC.
const createClient = () => suiGrpcClient as unknown as SuiJsonRpcClient

export default function SuiProvider({ children }: { children: ReactNode }) {
	const { networkConfig } = useNetworkConfig()

	return (
		<QueryClientProvider client={queryClient}>
			<SuiClientProvider
				networks={networkConfig}
				defaultNetwork={env.NEXT_PUBLIC_DEFAULT_NETWORK as Network}
				createClient={createClient}
			>
				<WalletProvider autoConnect slushWallet={{ name: "BLAST.FUN" }}>
					<AppContextProvider>{children}</AppContextProvider>
				</WalletProvider>
			</SuiClientProvider>
		</QueryClientProvider>
	)
}
