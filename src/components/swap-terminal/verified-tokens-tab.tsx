"use client";

import { FC, useMemo } from "react";
import { TokenGrid } from "./token-grid";
import { TokenOption } from "./types";
import { useVerifiedTokens } from "./use-verified-tokens";

interface VerifiedTokensTabProps {
    searchQuery: string;
    onSelectToken: (token: TokenOption) => void;
    disabledCoinTypes?: string[];
}

export const VerifiedTokensTab: FC<VerifiedTokensTabProps> = ({
    searchQuery,
    onSelectToken,
    disabledCoinTypes = [],
}) => {
    const { tokens, isLoading } = useVerifiedTokens();

    const filteredTokens = useMemo(() => {
        if (!searchQuery || searchQuery.length < 2) return tokens;

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
