"use client";

import { FC } from "react";
import { TokenAvatar } from "../tokens/token-avatar";
import { SUI_TYPE_ARG } from "@mysten/sui/utils";
import { TokenOption } from "./types";

interface TokenSelectorButtonProps {
    token: TokenOption | null;
    onClick: () => void;
}

export const TokenSelectorButton: FC<TokenSelectorButtonProps> = ({
    token,
    onClick,
}) => {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/20 rounded-md border border-border/50 hover:bg-muted/30 transition-colors shrink-0"
        >
            {token ? (
                <>
                    {token.coinType === SUI_TYPE_ARG ? (
                        <img
                            src="/assets/currency/sui-fill.svg"
                            alt="SUI"
                            width={18}
                            height={18}
                            className="shrink-0"
                        />
                    ) : (
                        <TokenAvatar
                            iconUrl={token.iconUrl}
                            symbol={token.symbol}
                            name={token.name}
                            className="w-[18px] h-[18px] rounded-full shrink-0"
                            fallbackClassName="text-xs"
                            enableHover={false}
                        />
                    )}
                    <span className="text-sm font-medium whitespace-nowrap">
                        {token.symbol}
                    </span>
                </>
            ) : (
                <span className="text-sm font-medium text-muted-foreground">
                    Select
                </span>
            )}
        </button>
    );
};

