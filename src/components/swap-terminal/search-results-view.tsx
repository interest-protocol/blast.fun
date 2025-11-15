"use client";

import { FC, useMemo, useState, useCallback } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "../ui/collapsible";
import { TokenOption } from "./types";
import { TokenGrid } from "./token-grid";
import { useVerifiedTokens } from "./use-verified-tokens";
import { useWalletTokens } from "./use-wallet-tokens";
import {
    useLatestTokens,
    useAboutToBondTokens,
    useBondedTokens,
} from "@/hooks/use-tokens";
import type { NexaToken } from "@/types/token";
import { useApp } from "@/context/app.context";
import { cn } from "@/utils";

interface SearchResultsViewProps {
    searchQuery: string;
    globalSearchResults: TokenOption[];
    isSearching: boolean;
    onSelectToken: (token: TokenOption) => void;
    disabledCoinTypes: string[];
}

type SectionKey =
    | "global"
    | "verified"
    | "wallet"
    | "newly-created"
    | "near-graduated"
    | "graduated";

const convertTokenToOption = (token: NexaToken): TokenOption => ({
    coinType: token.coinType,
    symbol: token.symbol,
    name: token.name,
    iconUrl: token.iconUrl,
    decimals: token.decimals,
});

const filterTokens = (tokens: TokenOption[], query: string): TokenOption[] => {
    if (!query || query.length < 2) return tokens;
    const lowerQuery = query.toLowerCase();
    return tokens.filter(
        (token) =>
            token.symbol.toLowerCase().includes(lowerQuery) ||
            token.name.toLowerCase().includes(lowerQuery) ||
            token.coinType.toLowerCase().includes(lowerQuery)
    );
};

export const SearchResultsView: FC<SearchResultsViewProps> = ({
    searchQuery,
    globalSearchResults,
    isSearching,
    onSelectToken,
    disabledCoinTypes,
}) => {
    const { isConnected } = useApp();
    const [expandedSections, setExpandedSections] = useState<Set<SectionKey>>(
        new Set(["global", "verified"])
    );

    // Fetch data from all sources
    const { tokens: verifiedTokens, isLoading: isLoadingVerified } =
        useVerifiedTokens();
    const { tokens: walletTokens, isLoading: isLoadingWallet } =
        useWalletTokens();
    const { data: newlyCreatedData, isLoading: isLoadingNewlyCreated } =
        useLatestTokens();
    const { data: nearGraduatedData, isLoading: isLoadingNearGraduated } =
        useAboutToBondTokens();
    const { data: graduatedData, isLoading: isLoadingGraduated } =
        useBondedTokens();

    // Global search results are already filtered by the API, so use them as-is
    const filteredGlobalResults = useMemo(
        () => globalSearchResults,
        [globalSearchResults]
    );

    const filteredVerifiedTokens = useMemo(
        () => filterTokens(verifiedTokens, searchQuery),
        [verifiedTokens, searchQuery]
    );

    const filteredWalletTokens = useMemo(
        () => filterTokens(walletTokens, searchQuery),
        [walletTokens, searchQuery]
    );

    const filteredNewlyCreated = useMemo(() => {
        if (!newlyCreatedData) return [];
        const tokens = newlyCreatedData.map(convertTokenToOption);
        return filterTokens(tokens, searchQuery);
    }, [newlyCreatedData, searchQuery]);

    const filteredNearGraduated = useMemo(() => {
        if (!nearGraduatedData) return [];
        const tokens = nearGraduatedData.map(convertTokenToOption);
        return filterTokens(tokens, searchQuery);
    }, [nearGraduatedData, searchQuery]);

    const filteredGraduated = useMemo(() => {
        if (!graduatedData) return [];
        const tokens = graduatedData.map(convertTokenToOption);
        return filterTokens(tokens, searchQuery);
    }, [graduatedData, searchQuery]);

    const toggleSection = useCallback((section: SectionKey) => {
        setExpandedSections((prev) => {
            const next = new Set(prev);
            if (next.has(section)) {
                next.delete(section);
            } else {
                next.add(section);
            }
            return next;
        });
    }, []);

    const sections: Array<{
        key: SectionKey;
        label: string;
        tokens: TokenOption[];
        isLoading: boolean;
    }> = [
        {
            key: "global",
            label: "GLOBAL SEARCH",
            tokens: filteredGlobalResults,
            isLoading: isSearching,
        },
        {
            key: "verified",
            label: "VERIFIED",
            tokens: filteredVerifiedTokens,
            isLoading: isLoadingVerified,
        },
        {
            key: "wallet",
            label: "WALLET",
            tokens: filteredWalletTokens,
            isLoading: isLoadingWallet,
        },
        {
            key: "newly-created",
            label: "NEWLY CREATED",
            tokens: filteredNewlyCreated,
            isLoading: isLoadingNewlyCreated,
        },
        {
            key: "near-graduated",
            label: "NEAR GRADUATED",
            tokens: filteredNearGraduated,
            isLoading: isLoadingNearGraduated,
        },
        {
            key: "graduated",
            label: "GRADUATED",
            tokens: filteredGraduated,
            isLoading: isLoadingGraduated,
        },
    ];

    // Filter out sections with no tokens (unless they're loading)
    // For wallet, only show if connected
    const visibleSections = sections.filter((section) => {
        if (section.key === "wallet" && !isConnected) {
            return false;
        }
        return section.tokens.length > 0 || section.isLoading;
    });

    if (visibleSections.length === 0) {
        return (
            <div className="flex w-full justify-center items-center text-center text-muted-foreground text-sm p-8">
                No tokens found.
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1 overflow-y-auto">
            {visibleSections.map((section) => {
                const isExpanded = expandedSections.has(section.key);
                const hasResults = section.tokens.length > 0;

                return (
                    <Collapsible
                        key={section.key}
                        open={isExpanded}
                        onOpenChange={() => toggleSection(section.key)}
                        className={cn(
                            "flex flex-col overflow-hidden",
                            isExpanded && "flex-1"
                        )}
                    >
                        <CollapsibleTrigger
                            className={cn(
                                "w-full flex items-center justify-between px-4 py-3 border-b border-border/50 hover:bg-muted/10 transition-colors",
                                isExpanded && "bg-muted/20"
                            )}
                        >
                            <span className="text-xs font-mono uppercase tracking-wider text-foreground">
                                {section.label}
                                {hasResults && (
                                    <span className="ml-2 text-muted-foreground">
                                        ({section.tokens.length})
                                    </span>
                                )}
                            </span>
                            {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="flex flex-1 border-b border-border/50 overflow-hidden">
                            <TokenGrid
                                tokens={section.tokens}
                                isLoading={section.isLoading}
                                searchQuery={searchQuery}
                                onSelectToken={onSelectToken}
                                disabledCoinTypes={disabledCoinTypes}
                            />
                        </CollapsibleContent>
                    </Collapsible>
                );
            })}
        </div>
    );
};
