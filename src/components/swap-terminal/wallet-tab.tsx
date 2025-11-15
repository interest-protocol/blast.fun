"use client";

import { FC, useMemo } from "react";
import { Loader2, Wallet } from "lucide-react";
import { TokenGrid } from "./token-grid";
import { TokenOption } from "./types";
import { useWalletTokens } from "./use-wallet-tokens";
import { useApp } from "@/context/app.context";
import { Button } from "../ui/button";

interface WalletTabProps {
    searchQuery: string;
    onSelectToken: (token: TokenOption) => void;
    disabledCoinTypes?: string[];
}

export const WalletTab: FC<WalletTabProps> = ({
    searchQuery,
    onSelectToken,
    disabledCoinTypes = [],
}) => {
    const { tokens, isLoading, isConnected } = useWalletTokens();
    const { setIsConnectDialogOpen } = useApp();

    const filteredTokens = useMemo(() => {
        if (!searchQuery || searchQuery.length < 2) return tokens;

        const query = searchQuery.toLowerCase();
        return tokens.filter(
            (token) =>
                token.symbol.toLowerCase().includes(query) ||
                token.name.toLowerCase().includes(query) ||
                token.coinType.toLowerCase().includes(query)
        );
    }, [tokens, searchQuery]);

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
                <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm font-mono uppercase tracking-wider text-foreground mb-2">
                    WALLET::NOT_CONNECTED
                </p>
                <p className="text-xs text-muted-foreground mb-6 max-w-sm">
                    Connect your wallet to view your tokens
                </p>
                <Button
                    onClick={() => setIsConnectDialogOpen(true)}
                    className="font-mono uppercase text-xs"
                >
                    Connect Wallet
                </Button>
            </div>
        );
    }


    return (
        <TokenGrid
            tokens={filteredTokens}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onSelectToken={onSelectToken}
            disabledCoinTypes={disabledCoinTypes}
        />
    );
};

