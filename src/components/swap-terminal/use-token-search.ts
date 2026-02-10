import { useState, useCallback } from "react";
import { useDebouncedCallback } from "use-debounce";
import type { TokenOption } from "./swap-terminal.types";
import {
    SEARCH_DEBOUNCE_MS,
    MIN_SEARCH_LENGTH,
    DEFAULT_DECIMALS,
} from "./swap-terminal.data";

export const useTokenSearch = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<TokenOption[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = useDebouncedCallback(async (query: string) => {
        if (!query || query.length < MIN_SEARCH_LENGTH) {
            setSearchResults([]);
            return;
        }

        try {
            setIsSearching(true);
            const res = await fetch(
                `/api/search/tokens?q=${encodeURIComponent(query)}`,
                { headers: { Accept: "application/json" } }
            );
            const raw = res.ok ? await res.json() : [];
            const results = Array.isArray(raw) ? raw : [];
            const tokenOptions: TokenOption[] = results.map(
                (result: {
                    coinType?: string;
                    symbol?: string;
                    name?: string;
                    icon?: string;
                    iconUrl?: string;
                    decimals?: number;
                    coinMetadata?: {
                        iconUrl?: string;
                        icon_url?: string;
                    };
                }) => ({
                    coinType: result.coinType ?? "",
                    symbol: result.symbol ?? "",
                    name: result.name ?? "",
                    iconUrl:
                        result.icon ??
                        result.iconUrl ??
                        result.coinMetadata?.iconUrl ??
                        result.coinMetadata?.icon_url,
                    decimals: result.decimals ?? DEFAULT_DECIMALS,
                })
            );
            setSearchResults(tokenOptions);
        } catch (error) {
            console.error("Search error:", error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, SEARCH_DEBOUNCE_MS);

    const resetSearch = useCallback(() => {
        setSearchQuery("");
        setSearchResults([]);
    }, []);

    return {
        searchQuery,
        setSearchQuery,
        searchResults,
        isSearching,
        handleSearch,
        resetSearch,
    };
};

