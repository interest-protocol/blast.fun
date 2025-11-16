"use client";

import { FC, useMemo } from "react";
import { TokenGrid } from "./token-grid";
import type { VerifiedTokensTabProps } from "./swap-terminal.types";
import { useVerifiedTokens } from "./use-verified-tokens";
import { MIN_SEARCH_LENGTH } from "./swap-terminal.data";

export const VerifiedTokensTab: FC<VerifiedTokensTabProps> = ({
    searchQuery,
    onSelectToken,
    disabledCoinTypes = [],
}) => {
    const { tokens, isLoading } = useVerifiedTokens();

    const filteredTokens = useMemo(() => {
        if (!searchQuery || searchQuery.length < MIN_SEARCH_LENGTH) return tokens;

        const query = searchQuery.toLowerCase();
        return tokens.filter(
            (token) =>
                token.symbol.toLowerCase().includes(query) ||
                token.name.toLowerCase().includes(query) ||
                token.coinType.toLowerCase().includes(query)
        );
    }, [tokens, searchQuery]);

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
