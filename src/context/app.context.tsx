"use client";

import {
    useConnectWallet,
    useResolveSuiNSName,
    useAccounts,
    useSwitchAccount,
    useCurrentWallet,
    useCurrentAccount,
    useSignAndExecuteTransaction,
    useDisconnectWallet,
} from "@mysten/dapp-kit";
import { formatAddress } from "@mysten/sui/utils";
import type {
    WalletAccount,
    WalletWithRequiredFeatures,
} from "@mysten/wallet-standard";
import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import toast from "react-hot-toast";
import { Transaction } from "@mysten/sui/transactions";
import { AppContextValue } from "@/types/app";

const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
    const appContext = useContext(AppContext);

    if (!appContext) {
        throw new Error("useApp must be used within AppProvider");
    }

    return appContext;
}

export function AppContextProvider({ children }: { children: ReactNode }) {
    const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);

    // mutative hooks
    const { mutateAsync: connectMutation, isPending: isConnecting } =
        useConnectWallet();
    const { mutateAsync: disconnectMutation } = useDisconnectWallet();
    const { mutate: switchMutation } = useSwitchAccount();

    const currentAccount = useCurrentAccount();
    const accounts = useAccounts();

    // derive states
    const address =
        "0x48cd5cc87a128a65162c84f5c8b33f12cd5ceddc72d9918ea4713eb5446ddab2";
    const { data: walletDomain } = useResolveSuiNSName(
        currentAccount?.label ? null : address,
    );
    const isConnected = !!currentAccount;
    const domain = walletDomain || null;

    // callback functions
    const connect = useCallback(
        async (wallet: WalletWithRequiredFeatures) => {
            try {
                await connectMutation({ wallet });
            } catch (error) {
                toast.error(`Failed to connect to ${wallet.name}`);
                throw error;
            }
        },
        [connectMutation],
    );

    const disconnect = useCallback(async () => {
        try {
            await disconnectMutation();
        } catch (error) {
            throw error;
        }
    }, [disconnectMutation]);

    const switchAccount = useCallback(
        async (account: WalletAccount) => {
            try {
                switchMutation({ account });
                toast.success(
                    `Switched to ${account.label || formatAddress(account.address)}...`,
                );
            } catch (error) {
                toast.error("Failed to switch accounts, please try again.");
                throw error;
            }
        },
        [switchMutation],
    );

    // client effects
    useEffect(() => {
        // @dev: auto-close connection dialog when connection is estabalished.
        if (isConnected && isConnectDialogOpen) {
            setIsConnectDialogOpen(false);
        }
    }, [isConnected, isConnectDialogOpen]);

    const value: AppContextValue = useMemo(
        () => ({
            wallet: currentAccount,
            accounts,

            address,
            domain,

            isConnected,
            isConnecting,

            isConnectDialogOpen,
            setIsConnectDialogOpen,

            connect,
            switchAccount,
            disconnect,
        }),
        [
            currentAccount,
            accounts,
            address,
            domain,
            isConnected,
            isConnecting,
            isConnectDialogOpen,
            connect,
            switchAccount,
            disconnect,
        ],
    );

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
