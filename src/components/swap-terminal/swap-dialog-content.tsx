"use client";

import { FC } from "react";
import { DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import type { SwapDialogContentProps } from "./swap-terminal.types";
import { TokenInputSection } from "./token-input-section";
import { SwapDirectionButton } from "./swap-direction-button";
import { SettingsBar } from "./settings-bar";
import { SwapActionButton } from "./swap-action-button";

export const SwapDialogContent: FC<SwapDialogContentProps> = ({
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    fromBalanceDisplay,
    toBalanceDisplay,
    usdValueIn,
    usdValueOut,
    isLoadingQuote,
    isSwapping,
    isConnected,
    slippage,
    isValidAmount,
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
                usdValue={usdValueIn}
                isLoading={isSwapping}
                onTokenSelect={() => onTokenSelect("from")}
                showMaxButton
                onMaxClick={onMaxClick}
            />
            <SwapDirectionButton onClick={onSwapTokens} />
            <TokenInputSection
                token={toToken}
                amount={toAmount}
                usdValue={usdValueOut}
                onAmountChange={() => {}}
                balance={toBalanceDisplay}
                isLoading={isLoadingQuote}
                isReadOnly
                onTokenSelect={() => onTokenSelect("to")}
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
