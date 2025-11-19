"use client";

import { FC, useState, useCallback } from "react";
import { normalizeStructTag } from "@mysten/sui/utils";
import { CollapsibleTokenCategory } from "./collapsible-token-category";
import type { TokenCategory } from "./swap-terminal.types";
import type { BlastTabProps } from "./swap-terminal.types";
import { CATEGORIES, DEFAULT_EXPANDED_CATEGORY } from "./swap-terminal.data";

export const BlastTab: FC<BlastTabProps> = ({
    searchQuery,
    onSelectToken,
    fromToken,
    toToken,
}) => {
    const disabledCoinTypes = [fromToken?.coinType, toToken?.coinType]
        .filter(
            (coinType): coinType is string =>
                coinType !== null && coinType !== undefined
        )
        .map((coinType) => normalizeStructTag(coinType));
    const [expandedCategory, setExpandedCategory] =
        useState<TokenCategory | null>(DEFAULT_EXPANDED_CATEGORY);

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
