"use client";

import { FC } from "react";
import { Loader2 } from "lucide-react";
import { TokenAvatar } from "../tokens/token-avatar";
import { TokenOption } from "./types";

interface TokenGridProps {
    tokens: TokenOption[];
    isLoading: boolean;
    searchQuery: string;
    onSelectToken: (token: TokenOption) => void;
}

export const TokenGrid: FC<TokenGridProps> = ({
    tokens,
    isLoading,
    searchQuery,
    onSelectToken,
}) => {
    if (isLoading && tokens.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (tokens.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground text-sm">
                {searchQuery.length >= 2
                    ? "No tokens found."
                    : "No tokens available."}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {tokens.map((token) => (
                <button
                    key={token.coinType}
                    onClick={() => onSelectToken(token)}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-muted/20 transition-colors group"
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
            ))}
        </div>
    );
};

