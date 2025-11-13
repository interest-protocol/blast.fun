"use client";

import { FC, useMemo } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "../ui/collapsible";
import { TokenOption } from "./types";
import { useTokenCategories } from "./use-token-categories";
import { TokenGrid } from "./token-grid";
import { cn } from "@/utils";

type TokenCategory = "newly-created" | "near-graduated" | "graduated";

interface CollapsibleTokenCategoryProps {
    category: TokenCategory;
    label: string;
    searchQuery: string;
    onSelectToken: (token: TokenOption) => void;
    isOpen: boolean;
    onToggle: (category: TokenCategory, isOpen: boolean) => void;
}

export const CollapsibleTokenCategory: FC<CollapsibleTokenCategoryProps> = ({
    category,
    label,
    searchQuery,
    onSelectToken,
    isOpen,
    onToggle,
}) => {
    const { tokens, isLoading } = useTokenCategories(category, isOpen);

    const handleOpenChange = (open: boolean) => {
        onToggle(category, open);
    };

    // Filter tokens by search query
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
            <CollapsibleContent className="flex flex-1 items-stretch border-b border-border/50 overflow-hidden">
                <TokenGrid
                    tokens={filteredTokens}
                    isLoading={isLoading}
                    searchQuery={searchQuery}
                    onSelectToken={onSelectToken}
                />
            </CollapsibleContent>
        </Collapsible>
    );
};
