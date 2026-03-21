import { useState, useCallback } from "react";
import { useDebouncedCallback } from "use-debounce";
import type { TokenOption } from "./swap-terminal.types";
import {
    SEARCH_DEBOUNCE_MS,
    MIN_SEARCH_LENGTH,
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
            setSearchResults([]);
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

