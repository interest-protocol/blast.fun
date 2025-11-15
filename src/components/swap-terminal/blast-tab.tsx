"use client";

import { FC, useState, useCallback } from "react";
import { normalizeStructTag } from "@mysten/sui/utils";
import { CollapsibleTokenCategory } from "./collapsible-token-category";
import { TokenOption } from "./types";

type TokenCategory = "newly-created" | "near-graduated" | "graduated";

const CATEGORIES: { key: TokenCategory; label: string }[] = [
    { key: "newly-created", label: "NEWLY CREATED" },
    { key: "near-graduated", label: "NEAR GRADUATED" },
    { key: "graduated", label: "GRADUATED" },
];

interface BlastTabProps {
    searchQuery: string;
    onSelectToken: (token: TokenOption) => void;
    fromToken: TokenOption | null;
    toToken: TokenOption | null;
    selectingSide: "from" | "to" | null;
}

export const BlastTab: FC<BlastTabProps> = ({
    searchQuery,
    onSelectToken,
    fromToken,
    toToken,
}) => {
    // Disable both selected tokens everywhere
    const disabledCoinTypes = [fromToken?.coinType, toToken?.coinType]
        .filter(
            (coinType): coinType is string =>
                coinType !== null && coinType !== undefined
        )
        .map((coinType) => normalizeStructTag(coinType));
    const [expandedCategory, setExpandedCategory] =
        useState<TokenCategory | null>("newly-created");

    const handleToggle = useCallback(
        (category: TokenCategory, isOpen: boolean) => {
            if (isOpen) {
                setExpandedCategory(category);
            } else {
                if (expandedCategory === category) {
                    setExpandedCategory(null);
                }
            }
        },
        [expandedCategory]
    );

    return (
        <div className="flex flex-col flex-1 overflow-y-auto">
            {CATEGORIES.map((category) => (
                <CollapsibleTokenCategory
                    key={category.key}
                    category={category.key}
                    label={category.label}
                    searchQuery={searchQuery}
                    onSelectToken={onSelectToken}
                    isOpen={expandedCategory === category.key}
                    onToggle={handleToggle}
                    disabledCoinTypes={disabledCoinTypes}
                />
            ))}
        </div>
    );
};
