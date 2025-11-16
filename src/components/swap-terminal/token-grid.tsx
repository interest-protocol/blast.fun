"use client";

import { FC } from "react";
import { Loader2 } from "lucide-react";
import { normalizeStructTag } from "@mysten/sui/utils";
import { TokenAvatar } from "../tokens/token-avatar";
import type { TokenGridProps } from "./swap-terminal.types";
import { cn } from "@/utils";
import { MIN_SEARCH_LENGTH } from "./swap-terminal.data";

export const TokenGrid: FC<TokenGridProps> = ({
    tokens,
    isLoading,
    searchQuery,
    onSelectToken,
    disabledCoinTypes = [],
}) => {
    if (isLoading && (!tokens || tokens.length === 0))
        return (
            <div className="flex w-full justify-center items-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );

    if (tokens.length === 0)
        return (
            <div className="flex w-full justify-center items-center text-center text-muted-foreground text-sm">
                {searchQuery.length >= MIN_SEARCH_LENGTH
                    ? "No tokens found."
                    : "No tokens available."}
            </div>
        );

    return (
        <div className="p-4 grid overflow-y-auto grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {tokens.map((token) => {
                const normalizedTokenCoinType = normalizeStructTag(
                    token.coinType
                );
                const isDisabled = disabledCoinTypes.includes(
                    normalizedTokenCoinType
                );
                return (
                    <button
                        key={token.coinType}
                        onClick={() => {
                            if (!isDisabled) {
                                onSelectToken(token);
                            }
                        }}
                        disabled={isDisabled}
                        className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors group",
                            isDisabled
                                ? "border-border/20 opacity-40 cursor-not-allowed"
                                : "border-border/50 hover:border-primary/50 hover:bg-muted/20"
                        )}
                    >
                        <TokenAvatar
                            iconUrl={token.iconUrl}
                            symbol={token.symbol}
                            name={token.name}
                            className="w-12 h-12 rounded-lg"
                            enableHover={false}
                        />
                        <div className="flex flex-col items-center w-full min-w-0">
                            <span className="font-mono font-bold text-xs uppercase tracking-wider text-foreground/90 truncate w-full text-center">
                                {token.symbol}
                            </span>
                            <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                                {token.name}
                            </span>
                        </div>
                    </button>
                );
            })}
        </div>
    );
};
