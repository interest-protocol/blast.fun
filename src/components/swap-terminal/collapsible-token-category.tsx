"use client";

import { FC, useMemo } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "../ui/collapsible";
import type { TokenCategory, CollapsibleTokenCategoryProps } from "./swap-terminal.types";
import { useTokenCategories } from "./use-token-categories";
import { TokenGrid } from "./token-grid";
import { cn } from "@/utils";
import { MIN_SEARCH_LENGTH } from "./swap-terminal.data";

export const CollapsibleTokenCategory: FC<CollapsibleTokenCategoryProps> = ({
    category,
    label,
    searchQuery,
    onSelectToken,
    isOpen,
    onToggle,
    disabledCoinTypes = [],
}) => {
    const { tokens, isLoading } = useTokenCategories(category, isOpen);

    const handleOpenChange = (open: boolean) => {
        onToggle(category, open);
    };

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
        <Collapsible
            open={isOpen}
            onOpenChange={handleOpenChange}
            className={cn("flex flex-col overflow-hidden", isOpen && "flex-1")}
        >
            <CollapsibleTrigger
                className={cn(
                    "w-full flex items-center justify-between px-4 py-3 border-b border-border/50 hover:bg-muted/10 transition-colors",
                    isOpen && "bg-muted/20"
                )}
            >
                <span className="text-xs font-mono uppercase tracking-wider text-foreground">
                    {label}
                </span>
                {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
            </CollapsibleTrigger>
            <CollapsibleContent className="flex flex-1 border-b border-border/50 overflow-hidden">
                <TokenGrid
                    tokens={filteredTokens}
                    isLoading={isLoading}
                    searchQuery={searchQuery}
                    onSelectToken={onSelectToken}
                    disabledCoinTypes={disabledCoinTypes}
                />
            </CollapsibleContent>
        </Collapsible>
    );
};
