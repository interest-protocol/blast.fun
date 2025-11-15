"use client";

import { useQuery } from "@tanstack/react-query";
import { TokenOption } from "./types";
import { normalizeStructTag, SUI_TYPE_ARG } from "@mysten/sui/utils";

interface VerifiedTokenData {
    type: string;
    symbol: string;
    name: string;
    logoUrl?: string;
    decimals?: number;
}

const VERIFIED_TOKENS_URL =
    "https://interest-protocol.github.io/tokens/sui.json";

const convertToTokenOption = (token: VerifiedTokenData): TokenOption => ({
    coinType: token.type,
    symbol: token.symbol,
    name: token.name,
    decimals: token.decimals || 9,
    iconUrl:
        normalizeStructTag(token.type) === normalizeStructTag(SUI_TYPE_ARG)
            ? "/assets/currency/sui-fill.svg"
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
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 10 * 60 * 1000, // 10 minutes
    });

    const tokens: TokenOption[] = data ? data.map(convertToTokenOption) : [];

    return { tokens, isLoading, error };
};
