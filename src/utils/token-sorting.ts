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

/**
 * Unified token sorting function used by both desktop and mobile components
 */
export function sortTokens(
    tokens: ReadonlyArray<NexaToken>,
    sortBy: TokenSortOption
): ReadonlyArray<NexaToken> {
    if (!tokens || tokens.length === 0) return [];

    const sortedTokens = [...tokens];

    switch (sortBy) {
        case "bondingProgress":
            return sortedTokens.sort((a, b) => {
                const aBonding = getFieldValue(a, "bondingProgress");
                const bBonding = getFieldValue(b, "bondingProgress");
                return bBonding - aBonding;
            });

        case "marketCap":
            return sortedTokens.sort((a, b) => {
                const aMarketCap = getFieldValue(a, "marketCap");
                const bMarketCap = getFieldValue(b, "marketCap");
                return bMarketCap - aMarketCap;
            });

        case "date":
            return sortedTokens.sort((a, b) => {
                const aDate = getTimestampValue(a, "createdAt");
                const bDate = getTimestampValue(b, "createdAt");
                return bDate - aDate;
            });

        case "volume":
            return sortedTokens.sort((a, b) => {
                const aVolume = getFieldValue(a, "volume24h");
                const bVolume = getFieldValue(b, "volume24h");
                return bVolume - aVolume;
            });

        case "holders":
            return sortedTokens.sort((a, b) => {
                const aHolders = getFieldValue(a, "holdersCount");
                const bHolders = getFieldValue(b, "holdersCount");
                return bHolders - aHolders;
            });

        case "lastTrade":
            return sortedTokens.sort((a, b) => {
                const aTimestamp = getTimestampValue(a, "lastTradeAt");
                const bTimestamp = getTimestampValue(b, "lastTradeAt");
                return bTimestamp - aTimestamp;
            });

        case "liquidity":
            return sortedTokens.sort((a, b) => {
                const aLiquidity = getFieldValue(a, "liquidity");
                const bLiquidity = getFieldValue(b, "liquidity");
                return bLiquidity - aLiquidity;
            });

        case "devHoldings":
            return sortedTokens.sort((a, b) => {
                const aDevHoldings = getFieldValue(a, "devHoldings");
                const bDevHoldings = getFieldValue(b, "devHoldings");
                return aDevHoldings - bDevHoldings; // Lower is better for dev holdings
            });

        case "top10Holdings":
            return sortedTokens.sort((a, b) => {
                const aTop10Holdings = getFieldValue(a, "top10Holdings");
                const bTop10Holdings = getFieldValue(b, "top10Holdings");
                return aTop10Holdings - bTop10Holdings; // Lower is better for top10 holdings
            });

        default:
            return sortedTokens;
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
    tokens: ReadonlyArray<NexaToken>,
    tabType: "new" | "graduating" | "graduated"
): ReadonlyArray<NexaToken> {
    const defaultSort = getDefaultSort(tabType);
    return sortTokens(tokens, defaultSort);
}
