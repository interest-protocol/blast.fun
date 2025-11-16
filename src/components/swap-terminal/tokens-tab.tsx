"use client";

import { FC, useState, useCallback } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { normalizeStructTag } from "@mysten/sui/utils";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "../ui/collapsible";
import type { TokenOption, TokenSection, TokensTabProps } from "./swap-terminal.types";
import { VerifiedTokensTab } from "./verified-tokens-tab";
import { WalletTab } from "./wallet-tab";
import { cn } from "@/utils";

export const TokensTab: FC<TokensTabProps> = ({
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
    const [expandedSection, setExpandedSection] = useState<TokenSection | null>(
        "verified"
    );

    const handleToggle = useCallback(
        (section: TokenSection, isOpen: boolean) => {
            if (isOpen) {
                setExpandedSection(section);
            } else {
                if (expandedSection === section) {
                    setExpandedSection(null);
                }
            }
        },
        [expandedSection]
    );

    return (
        <div className="flex flex-col flex-1 overflow-y-auto">
            <Collapsible
                open={expandedSection === "verified"}
                onOpenChange={(open) => handleToggle("verified", open)}
                className={cn(
                    "flex flex-col overflow-hidden",
                    expandedSection === "verified" && "flex-1"
                )}
            >
                <CollapsibleTrigger
                    className={cn(
                        "w-full flex items-center justify-between px-4 py-3 border-b border-border/50 hover:bg-muted/10 transition-colors",
                        expandedSection === "verified" && "bg-muted/20"
                    )}
                >
                    <span className="text-xs font-mono uppercase tracking-wider text-foreground">
                        VERIFIED
                    </span>
                    {expandedSection === "verified" ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                </CollapsibleTrigger>
                <CollapsibleContent className="flex flex-1 items-stretch border-b border-border/50 overflow-hidden">
                    <VerifiedTokensTab
                        searchQuery={searchQuery}
                        onSelectToken={onSelectToken}
                        disabledCoinTypes={disabledCoinTypes}
                    />
                </CollapsibleContent>
            </Collapsible>
            <Collapsible
                open={expandedSection === "wallet"}
                onOpenChange={(open) => handleToggle("wallet", open)}
                className={cn(
                    "flex flex-col overflow-hidden",
                    expandedSection === "wallet" && "flex-1"
                )}
            >
                <CollapsibleTrigger
                    className={cn(
                        "w-full flex items-center justify-between px-4 py-3 border-b border-border/50 hover:bg-muted/10 transition-colors",
                        expandedSection === "wallet" && "bg-muted/20"
                    )}
                >
                    <span className="text-xs font-mono uppercase tracking-wider text-foreground">
                        WALLET
                    </span>
                    {expandedSection === "wallet" ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                </CollapsibleTrigger>
                <CollapsibleContent className="flex flex-1 items-stretch border-b border-border/50 overflow-hidden">
                    <WalletTab
                        searchQuery={searchQuery}
                        onSelectToken={onSelectToken}
                        disabledCoinTypes={disabledCoinTypes}
                    />
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
};
