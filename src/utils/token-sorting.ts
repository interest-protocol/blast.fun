import type { NexaToken, Token, TokenSortOption } from "@/types/token";

type SortableToken = Token | NexaToken;

/**
 * Robust field accessor that handles multiple data structure patterns
 */
function getFieldValue(token: SortableToken, field: string): number {
    if ("market" in token && token.market) {
        const marketValue = (token.market as unknown as Record<string, unknown>)?.[field];
        if (typeof marketValue === "number") {
            return marketValue;
        }
    }
    const directValue = (token as unknown as Record<string, unknown>)[field];
    return typeof directValue === "number" ? directValue : 0;
}

/**
 * Get timestamp value for date/time based sorting
 */
function getTimestampValue(
    token: SortableToken,
    field: "createdAt" | "lastTradeAt"
): number {
    if (field === "createdAt") {
        const value = token.createdAt;
        return typeof value === "number" ? value : new Date(value).getTime();
    }

    if (field === "lastTradeAt") {
        if ("lastTradeAt" in token) {
            const value = token.lastTradeAt;
            if (!value) return 0;
            return typeof value === "string" ? new Date(value).getTime() : value;
        }
        return 0;
    }

    return 0;
}

import type { NoodlesCoinList } from "@/lib/noodles/client";

export function sortTokens(
    tokens: ReadonlyArray<NoodlesCoinList>,
    sortBy: TokenSortOption
): ReadonlyArray<NoodlesCoinList> {
    if (!tokens || tokens.length === 0) return [];

    const sorted = [...tokens];

    switch (sortBy) {
        case "bondingProgress":
            return sorted.sort((a, b) => b.bondingCurveProgress - a.bondingCurveProgress);

        case "marketCap":
            return sorted.sort((a, b) => b.marketCap - a.marketCap);

        case "date":
            return sorted.sort((a, b) =>
                new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
            );

        case "volume":
            return sorted.sort((a, b) => b.volume24h - a.volume24h);

        case "holders":
            return sorted.sort((a, b) => b.holders - a.holders);

        case "liquidity":
            return sorted.sort((a, b) => b.liquidity - a.liquidity);

        case "devHoldings":
            return sorted.sort((a, b) => a.devHoldings - b.devHoldings);

        case "top10Holdings":
            return sorted.sort((a, b) => a.top10Holdings - b.top10Holdings);

        // NoodlesCoinList doesn't have lastTrade — fallback to publishedAt
        case "lastTrade":
            return sorted.sort((a, b) =>
                new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
            );

        default:
            return sorted;
    }
}
/**
 * Get default sort option based on tab type
 */
export function getDefaultSort(
    tabType: "new" | "graduating" | "graduated"
): TokenSortOption {
    switch (tabType) {
        case "graduating":
            return "bondingProgress";
        case "graduated":
            return "marketCap";
        case "new":
        default:
            return "date";
    }
}

/**
 * Apply default sorting based on tab type when no specific sort is selected
 */
export function applyDefaultSort(
    tokens: ReadonlyArray<NoodlesCoinList>,
    tabType: "new" | "graduating" | "graduated"
): ReadonlyArray<NoodlesCoinList> {
    const defaultSort = getDefaultSort(tabType);
    return sortTokens(tokens, defaultSort);
}
