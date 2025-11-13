"use client";

import { FC, useState, useCallback } from "react";
import { Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { TokenOption } from "./types";
import { SUI_TYPE_ARG } from "@mysten/sui/utils";
import { PopularTokens } from "./popular-tokens";
import { CollapsibleTokenCategory } from "./collapsible-token-category";

type TokenCategory = "newly-created" | "near-graduated" | "graduated";

interface TokenSearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onSelectToken: (token: TokenOption) => void;
}

const CATEGORIES: { key: TokenCategory; label: string }[] = [
    { key: "newly-created", label: "NEWLY CREATED" },
    { key: "near-graduated", label: "NEAR GRADUATED" },
    { key: "graduated", label: "GRADUATED" },
];

// Popular tokens to display above tabs
const POPULAR_TOKENS: TokenOption[] = [
    {
        coinType: SUI_TYPE_ARG,
        symbol: "SUI",
        name: "Sui",
        iconUrl: "/assets/currency/sui-fill.svg",
        decimals: 9,
    },
    {
        coinType:
            "0xc466c28d87b3d5cd34f3d5c088751532d71a38d93a8aae4551dd56272cfb4355::manifest::MANIFEST",
        symbol: "MANIFEST",
        name: "MANIFEST",
        iconUrl:
            "data:image/jpeg;base64,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",
        decimals: 9,
    },
    {
        coinType:
            "0xcee208b8ae33196244b389e61ffd1202e7a1ae06c8ec210d33402ff649038892::aida::AIDA",
        symbol: "AIDA",
        name: "AIDA",
        iconUrl:
            "/api/coin/0xcee208b8ae33196244b389e61ffd1202e7a1ae06c8ec210d33402ff649038892::aida::AIDA/image",
        decimals: 9,
    },
];

export const TokenSearchDialog: FC<TokenSearchDialogProps> = ({
    open,
    onOpenChange,
    searchQuery,
    onSearchChange,
    onSelectToken,
}) => {
    // Track which category is expanded (only one can be expanded at a time)
    const [expandedCategory, setExpandedCategory] =
        useState<TokenCategory | null>("newly-created");

    const handleToggle = useCallback(
        (category: TokenCategory, isOpen: boolean) => {
            // If opening a category, set it as expanded (this will collapse the previous one)
            // If closing a category, set expanded to null
            if (isOpen) {
                setExpandedCategory(category);
            } else {
                // Allow closing the expanded category
                if (expandedCategory === category) {
                    setExpandedCategory(null);
                }
            }
        },
        [expandedCategory]
    );

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
                </div>
                <PopularTokens
                    tokens={POPULAR_TOKENS}
                    onSelectToken={onSelectToken}
                />
                {CATEGORIES.map((category) => (
                    <CollapsibleTokenCategory
                        key={category.key}
                        category={category.key}
                        label={category.label}
                        searchQuery={searchQuery}
                        onSelectToken={onSelectToken}
                        isOpen={expandedCategory === category.key}
                        onToggle={handleToggle}
                    />
                ))}
            </DialogContent>
        </Dialog>
    );
};
