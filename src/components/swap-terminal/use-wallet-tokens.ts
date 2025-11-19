"use client";

import { useQuery } from "@tanstack/react-query";
import type { TokenOption, WalletCoin } from "./swap-terminal.types";
import { useApp } from "@/context/app.context";
import { normalizeStructTag, SUI_TYPE_ARG } from "@mysten/sui/utils";
import {
    SUI_ICON_URL,
    WALLET_TOKENS_STALE_TIME,
    WALLET_TOKENS_REFETCH_INTERVAL,
} from "./swap-terminal.data";

const convertToTokenOption = (coin: WalletCoin): TokenOption => ({
    coinType: coin.coinType,
    symbol: coin.symbol,
    name: coin.name,
    iconUrl:
        normalizeStructTag(coin.coinType) === normalizeStructTag(SUI_TYPE_ARG)
            ? SUI_ICON_URL
            : coin.iconUrl,
    decimals: coin.decimals,
});

export const useWalletTokens = () => {
    const { address, isConnected } = useApp();

    const { data, isLoading, error } = useQuery<WalletCoin[]>({
        queryKey: ["wallet-tokens", address],
        queryFn: async () => {
            if (!address) {
                return [];
            }

            const response = await fetch("/api/wallet/coins", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ address }),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch wallet tokens");
            }

            const result = await response.json();
            return result.coins || [];
        },
        enabled: isConnected && !!address,
        staleTime: WALLET_TOKENS_STALE_TIME,
        refetchInterval: WALLET_TOKENS_REFETCH_INTERVAL,
    });

    const tokens: TokenOption[] = data ? data.map(convertToTokenOption) : [];

    return { tokens, isLoading, error, isConnected };
};
