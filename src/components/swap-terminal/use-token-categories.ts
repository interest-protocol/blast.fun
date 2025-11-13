"use client";

import { useMemo } from "react";
import {
    useLatestTokens,
    useAboutToBondTokens,
    useBondedTokens,
} from "@/hooks/use-tokens";
import type { NexaToken } from "@/types/token";
import { TokenOption } from "./types";

type TokenCategory = "newly-created" | "near-graduated" | "graduated";

const convertTokenToOption = (token: NexaToken): TokenOption => ({
    coinType: token.coinType,
    symbol: token.symbol,
    name: token.name,
    iconUrl: token.iconUrl,
    decimals: token.decimals,
});

export const useTokenCategories = (activeCategory: TokenCategory) => {
    const latestTokensQuery = useLatestTokens(undefined, {
        enabled: activeCategory === "newly-created",
        refetchInterval: activeCategory === "newly-created" ? 10000 : undefined,
    });

    const aboutToBondQuery = useAboutToBondTokens(undefined, {
        enabled: activeCategory === "near-graduated",
        refetchInterval:
            activeCategory === "near-graduated" ? 10000 : undefined,
    });

    const bondedTokensQuery = useBondedTokens(undefined, {
        enabled: activeCategory === "graduated",
        refetchInterval: activeCategory === "graduated" ? 30000 : undefined,
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
