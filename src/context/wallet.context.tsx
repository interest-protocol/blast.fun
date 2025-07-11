"use client";

import {
    createContext,
    type ReactNode,
    useContext,
    useCallback,
    useMemo,
    useState,
    useEffect,
} from "react";
import {
    useConnectWallet,
    useCurrentAccount,
    useDisconnectWallet,
    useResolveSuiNSName,
} from "@mysten/dapp-kit";
import type { WalletWithRequiredFeatures } from "@mysten/wallet-standard";
import toast from "react-hot-toast";

interface WalletContextValue {
    address: string | null;
    domain: string | null;

    isConnected: boolean;
    isConnecting: boolean;

    isConnectDialogOpen: boolean;
    setIsConnectDialogOpen: (open: boolean) => void;

    connect: (wallet: WalletWithRequiredFeatures) => Promise<void>;
    disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function useWallet() {
    const walletContext = useContext(WalletContext);

    if (!walletContext) {
        throw new Error("useWallet must be used within WalletProvider");
    }

    return walletContext;
}

export function WalletContextProvider({ children }: { children: ReactNode }) {
    const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);

    const { mutateAsync: connectMutation, isPending: isConnecting } = useConnectWallet();
    const { mutateAsync: disconnectMutation } = useDisconnectWallet();
    const currentAccount = useCurrentAccount();

    const address = currentAccount?.address || null;
    const isConnected = !!currentAccount;
    const { data: walletDomain } = useResolveSuiNSName(
        currentAccount?.label ? null : address
    );
    const domain = walletDomain ? `@${walletDomain.replace(/\.sui$/i, "")}` : null;

    const connect = useCallback(
        async (wallet: WalletWithRequiredFeatures) => {
            try {
                await connectMutation({ wallet });
            } catch (error) {
                console.error("Failed to connect wallet:", error);
                toast.error(`Failed to connect to ${wallet.name}`);
                throw error;
            }
        },
        [connectMutation]
    );

    const disconnect = useCallback(async () => {
        try {
            await disconnectMutation();
        } catch (error) {
            console.error("Failed to disconnect wallet:", error);
            throw error;
        }
    }, [disconnectMutation]);

    // auto close dialog after connection
    useEffect(() => {
        if (isConnected && isConnectDialogOpen) {
            setIsConnectDialogOpen(false);
        }
    }, [isConnected, isConnectDialogOpen]);

    const value: WalletContextValue = useMemo(
        () => ({
            address,
            domain,

            isConnected,
            isConnecting,

            isConnectDialogOpen,
            setIsConnectDialogOpen,

            connect,
            disconnect,
        }),
        [address, domain, isConnected, isConnecting, isConnectDialogOpen, connect, disconnect]
    );

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
}