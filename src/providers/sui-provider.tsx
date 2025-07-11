"use client";

import { ReactNode } from "react";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Network } from "@/types/network";
import useNetworkConfig from "@/hooks/use-network-config";

import "@mysten/dapp-kit/dist/index.css";
import { WalletContextProvider } from "@/context/wallet.context";

const queryClient = new QueryClient();

export default function SuiProvider({ children }: { children: ReactNode }) {
    const { networkConfig } = useNetworkConfig();

    return (
        <QueryClientProvider client={queryClient}>
            <SuiClientProvider
                networks={networkConfig}
                defaultNetwork={Network.MAINNET}
            >
                <WalletProvider autoConnect slushWallet={{ name: 'xPump' }}>
                    <WalletContextProvider>
                        {children}
                    </WalletContextProvider>
                </WalletProvider>
            </SuiClientProvider>
        </QueryClientProvider>
    );
}
