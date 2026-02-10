"use client";

import { FC, useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { normalizeStructTag } from "@mysten/sui/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import type { TokenOption, TokenSearchDialogProps } from "./swap-terminal.types";
import { BlastTab } from "./blast-tab";
import { TokensTab } from "./tokens-tab";
import { SearchResultsView } from "./search-results-view";
import {
    SEARCH_DEBOUNCE_MS,
    MIN_SEARCH_LENGTH,
    DEFAULT_DECIMALS,
} from "./swap-terminal.data";

export const TokenSearchDialog: FC<TokenSearchDialogProps> = ({
    open,
    onOpenChange,
    searchQuery,
    onSearchChange,
    onSelectToken,
    fromToken,
    toToken,
}) => {
    const [activeTab, setActiveTab] = useState("tokens");
    const [globalSearchResults, setGlobalSearchResults] = useState<
        TokenOption[]
    >([]);
    const [isSearching, setIsSearching] = useState(false);

    const disabledCoinTypes = [fromToken?.coinType, toToken?.coinType]
        .filter(
            (coinType): coinType is string =>
                coinType !== null && coinType !== undefined
        )
        .map((coinType) => normalizeStructTag(coinType));

    const handleGlobalSearch = useDebouncedCallback(async (query: string) => {
        if (!query || query.length < MIN_SEARCH_LENGTH) {
            setGlobalSearchResults([]);
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
            setGlobalSearchResults(tokenOptions);
        } catch (error) {
            console.error("Search error:", error);
            setGlobalSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, SEARCH_DEBOUNCE_MS);

    useEffect(() => {
        handleGlobalSearch(searchQuery);
    }, [searchQuery, handleGlobalSearch]);

    useEffect(() => {
        if (!open) {
            setGlobalSearchResults([]);
            setIsSearching(false);
        }
    }, [open]);

    const hasSearchQuery = searchQuery.length >= MIN_SEARCH_LENGTH;
    const showGlobalSearch = hasSearchQuery;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl p-0 gap-0 h-[600px] flex flex-col">
                <DialogHeader className="px-4 pt-4 pb-2 border-b">
                    <DialogTitle className="font-mono text-sm uppercase tracking-wider">
                        SELECT::TOKEN
                    </DialogTitle>
                </DialogHeader>

                <div className="flex items-center border-b px-4 py-3">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <input
                        className="flex h-10 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Search tokens..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        autoFocus
                    />
                    {isSearching && (
                        <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                </div>
                {showGlobalSearch ? (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <SearchResultsView
                            searchQuery={searchQuery}
                            globalSearchResults={globalSearchResults}
                            isSearching={isSearching}
                            onSelectToken={onSelectToken}
                            disabledCoinTypes={disabledCoinTypes}
                        />
                    </div>
                ) : (
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="flex-1 flex flex-col overflow-hidden"
                    >
                        <TabsList className="w-full justify-start bg-transparent h-auto p-1">
                            <TabsTrigger
                                value="tokens"
                                className="font-mono text-xs uppercase tracking-wider data-[state=active]:bg-muted/20 p-2"
                            >
                                TOKENS
                            </TabsTrigger>
                            <TabsTrigger
                                value="blast"
                                className="font-mono text-xs uppercase tracking-wider data-[state=active]:bg-muted/20 p-2"
                            >
                                BLAST
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent
                            value="tokens"
                            className="flex flex-col flex-1 overflow-hidden m-0"
                        >
                            <TokensTab
                                searchQuery={searchQuery}
                                onSelectToken={onSelectToken}
                                fromToken={fromToken}
                                toToken={toToken}
                            />
                        </TabsContent>
                        <TabsContent
                            value="blast"
                            className="flex flex-col flex-1 overflow-hidden m-0"
                        >
                            <BlastTab
                                searchQuery={searchQuery}
                                onSelectToken={onSelectToken}
                                fromToken={fromToken}
                                toToken={toToken}
                            />
                        </TabsContent>
                    </Tabs>
                )}
            </DialogContent>
        </Dialog>
    );
};
