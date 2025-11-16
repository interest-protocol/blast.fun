"use client";

import { FC } from "react";
import { Wallet, Loader2 } from "lucide-react";
import { formatNumberWithSuffix } from "@/utils/format";
import type { TokenInputSectionProps } from "./swap-terminal.types";
import { TokenSelectorButton } from "./token-selector-button";

export const TokenInputSection: FC<TokenInputSectionProps> = ({
    token,
    amount,
    onAmountChange,
    balance,
    usdValue,
    isLoading,
    isReadOnly = false,
    onTokenSelect,
    showMaxButton = false,
    onMaxClick,
    priceDisplay,
}) => (
    <div className="border border-border/50 rounded-lg p-3 space-y-2 bg-muted/5">
        <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
                <Wallet className="h-3.5 w-3.5" />
                <span>Balance</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-foreground font-mono">
                    {formatNumberWithSuffix(balance)}
                </span>
                <span className="text-muted-foreground">
                    {token?.symbol || "---"}
                </span>
                {showMaxButton && onMaxClick && (
                    <button
                        onClick={onMaxClick}
                        className="text-blue-400 hover:text-blue-300 font-medium text-xs transition-colors"
                        disabled={!token || balance <= 0}
                    >
                        MAX
                    </button>
                )}
            </div>
        </div>
        <div className="space-y-1.5">
            <div className="flex items-center gap-2 relative">
                <input
                    type="text"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => onAmountChange(e.target.value)}
                    readOnly={isReadOnly}
                    className="flex-1 bg-transparent text-2xl font-medium outline-none placeholder:text-muted-foreground/50 text-foreground min-w-0"
                    disabled={isLoading}
                    inputMode="decimal"
                />
                <TokenSelectorButton token={token} onClick={onTokenSelect} />
                {isLoading && isReadOnly && (
                    <div className="absolute right-20">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                )}
            </div>
            <span className="text-xs text-muted-foreground">
                {priceDisplay ||
                    (usdValue !== undefined
                        ? `≈ $${usdValue.toFixed(2)} USD`
                        : "Enter amount to see quote")}
            </span>
        </div>
    </div>
);
