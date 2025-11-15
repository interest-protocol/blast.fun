"use client";

import { FC } from "react";
import { DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { TokenOption } from "./types";
import { TokenInputSection } from "./token-input-section";
import { SwapDirectionButton } from "./swap-direction-button";
import { SettingsBar } from "./settings-bar";
import { SwapActionButton } from "./swap-action-button";

interface SwapDialogContentProps {
    fromToken: TokenOption | null;
    toToken: TokenOption | null;
    fromAmount: string;
    toAmount: string;
    fromBalanceDisplay: number;
    toBalanceDisplay: number;
    usdValue: number;
    isLoadingQuote: boolean;
    isSwapping: boolean;
    isConnected: boolean;
    slippage: number;
    isValidAmount: boolean;
    toAmountPriceDisplay: string;
    onFromAmountChange: (amount: string) => void;
    onTokenSelect: (side: "from" | "to") => void;
    onSwapTokens: () => void;
    onSwap: () => void;
    onMaxClick: () => void;
    onSettingsClick: () => void;
}

export const SwapDialogContent: FC<SwapDialogContentProps> = ({
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    fromBalanceDisplay,
    toBalanceDisplay,
    usdValue,
    isLoadingQuote,
    isSwapping,
    isConnected,
    slippage,
    isValidAmount,
    toAmountPriceDisplay,
    onFromAmountChange,
    onTokenSelect,
    onSwapTokens,
    onSwap,
    onMaxClick,
    onSettingsClick,
}) => (
    <DialogContent className="max-w-md p-0 gap-0">
        <DialogHeader className="px-3 pt-3 pb-2 border-b border-border/50">
            <DialogTitle className="font-mono text-sm uppercase tracking-wider">
                SWAP::TERMINAL
            </DialogTitle>
        </DialogHeader>
        <div className="p-3 space-y-3">
            <TokenInputSection
                token={fromToken}
                amount={fromAmount}
                onAmountChange={onFromAmountChange}
                balance={fromBalanceDisplay}
                usdValue={usdValue}
                isLoading={isSwapping}
                onTokenSelect={() => onTokenSelect("from")}
                showMaxButton
                onMaxClick={onMaxClick}
            />
            <SwapDirectionButton onClick={onSwapTokens} />
            <TokenInputSection
                token={toToken}
                amount={toAmount}
                onAmountChange={() => {}}
                balance={toBalanceDisplay}
                isLoading={isLoadingQuote}
                isReadOnly
                onTokenSelect={() => onTokenSelect("to")}
                priceDisplay={toAmountPriceDisplay}
            />
            <SettingsBar
                slippage={slippage}
                onSettingsClick={onSettingsClick}
            />
            <SwapActionButton
                fromToken={fromToken}
                toToken={toToken}
                fromAmount={fromAmount}
                isSwapping={isSwapping}
                isLoadingQuote={isLoadingQuote}
                isConnected={isConnected}
                isValidAmount={isValidAmount}
                onClick={onSwap}
            />
        </div>
    </DialogContent>
);
