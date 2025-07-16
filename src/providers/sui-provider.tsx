"use client";

import { ReactNode } from "react";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppContextProvider } from "@/context/app.context";
import { Network } from "@/types/network";
import useNetworkConfig from "@/hooks/use-network-config";

import "@mysten/dapp-kit/dist/index.css";

const queryClient = new QueryClient();

export default function SuiProvider({ children }: { children: ReactNode }) {
    const { networkConfig } = useNetworkConfig();

    return (
        <QueryClientProvider client={queryClient}>
            <SuiClientProvider
                networks={networkConfig}
                defaultNetwork={Network.MAINNET}
            >
                <WalletProvider autoConnect slushWallet={{ name: 'xPump Launchpad' }}>
                    <AppContextProvider>
                        {children}
                    </AppContextProvider>
                </WalletProvider>
            </SuiClientProvider>
        </QueryClientProvider>
    );
}
