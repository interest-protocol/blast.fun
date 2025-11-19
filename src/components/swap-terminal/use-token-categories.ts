"use client";

import { useMemo } from "react";
import {
    useLatestTokens,
    useAboutToBondTokens,
    useBondedTokens,
} from "@/hooks/use-tokens";
import type { NexaToken } from "@/types/token";
import type { TokenOption, TokenCategory } from "./swap-terminal.types";
import {
    NEWLY_CREATED_REFETCH_INTERVAL,
    NEAR_GRADUATED_REFETCH_INTERVAL,
    GRADUATED_REFETCH_INTERVAL,
} from "./swap-terminal.data";

const convertTokenToOption = (token: NexaToken): TokenOption => ({
    coinType: token.coinType,
    symbol: token.symbol,
    name: token.name,
    iconUrl: token.iconUrl,
    decimals: token.decimals,
});

export const useTokenCategories = (
    activeCategory: TokenCategory,
    enabled: boolean = true
) => {
    const latestTokensQuery = useLatestTokens(undefined, {
        enabled: enabled && activeCategory === "newly-created",
        refetchInterval:
            enabled && activeCategory === "newly-created"
                ? NEWLY_CREATED_REFETCH_INTERVAL
                : undefined,
    });

    const aboutToBondQuery = useAboutToBondTokens(undefined, {
        enabled: enabled && activeCategory === "near-graduated",
        refetchInterval:
            enabled && activeCategory === "near-graduated"
                ? NEAR_GRADUATED_REFETCH_INTERVAL
                : undefined,
    });

    const bondedTokensQuery = useBondedTokens(undefined, {
        enabled: enabled && activeCategory === "graduated",
        refetchInterval:
            enabled && activeCategory === "graduated"
                ? GRADUATED_REFETCH_INTERVAL
                : undefined,
    });

    const { data, isLoading, error } =
        activeCategory === "newly-created"
            ? latestTokensQuery
            : activeCategory === "near-graduated"
            ? aboutToBondQuery
            : bondedTokensQuery;

    const tokens = useMemo(() => {
        if (!data || data.length === 0) return [];
        return data.map(convertTokenToOption);
    }, [data]);

    return { tokens, isLoading, error };
};
