"use client";

import { FC } from "react";
import { TokenAvatar } from "../tokens/token-avatar";
import { SUI_TYPE_ARG } from "@mysten/sui/utils";
import { TokenOption } from "./types";

interface PopularTokensProps {
    tokens: TokenOption[];
    onSelectToken: (token: TokenOption) => void;
}

export const PopularTokens: FC<PopularTokensProps> = ({
    tokens,
    onSelectToken,
}) => {
    return (
        <div className="flex items-center gap-3 px-4 py-3 border-b">
            {tokens.map((token) => (
                <button
                    key={token.coinType}
                    onClick={() => onSelectToken(token)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-muted/20 transition-colors"
                >
                    {token.coinType === SUI_TYPE_ARG ? (
                        <img
                            src={token.iconUrl}
                            alt={token.symbol}
                            width={20}
                            height={20}
                            className="rounded-full"
                        />
                    ) : (
                        <TokenAvatar
                            iconUrl={token.iconUrl}
                            symbol={token.symbol}
                            name={token.name}
                            className="w-5 h-5 rounded-full"
                            enableHover={false}
                        />
                    )}
                    <span className="text-xs font-mono font-bold uppercase tracking-wider">
                        {token.symbol}
                    </span>
                </button>
            ))}
        </div>
    );
};

