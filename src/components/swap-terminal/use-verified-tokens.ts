"use client";

import { useQuery } from "@tanstack/react-query";
import type { TokenOption, VerifiedTokenData } from "./swap-terminal.types";
import { normalizeStructTag, SUI_TYPE_ARG } from "@mysten/sui/utils";
import {
    VERIFIED_TOKENS_URL,
    DEFAULT_DECIMALS,
    SUI_ICON_URL,
    VERIFIED_TOKENS_STALE_TIME,
    VERIFIED_TOKENS_REFETCH_INTERVAL,
} from "./swap-terminal.data";

const convertToTokenOption = (token: VerifiedTokenData): TokenOption => ({
    coinType: token.type,
    symbol: token.symbol,
    name: token.name,
    decimals: token.decimals || DEFAULT_DECIMALS,
    iconUrl:
        normalizeStructTag(token.type) === normalizeStructTag(SUI_TYPE_ARG)
            ? SUI_ICON_URL
            : token.logoUrl,
});

export const useVerifiedTokens = () => {
    const { data, isLoading, error } = useQuery<VerifiedTokenData[]>({
        queryKey: ["verified-tokens"],
        queryFn: async () => {
            const response = await fetch(VERIFIED_TOKENS_URL);
            if (!response.ok) {
                throw new Error("Failed to fetch verified tokens");
            }
            const tokens = await response.json();
            return Array.isArray(tokens) ? tokens : [];
        },
        staleTime: VERIFIED_TOKENS_STALE_TIME,
        refetchInterval: VERIFIED_TOKENS_REFETCH_INTERVAL,
    });

    const tokens: TokenOption[] = data ? data.map(convertToTokenOption) : [];

    return { tokens, isLoading, error };
};
