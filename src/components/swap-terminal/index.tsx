"use client";

import { FC, useState, useCallback } from "react";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { ArrowLeftRight } from "lucide-react";
import type { TokenOption } from "./swap-terminal.types";
import { TokenSearchDialog } from "./token-search-dialog";
import { SlippageSettingsDialog } from "./slippage-settings-dialog";
import { SwapDialogContent } from "./swap-dialog-content";
import { useSwapTerminal } from "./use-swap-terminal";

const SwapTerminal: FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [tokenSearchOpen, setTokenSearchOpen] = useState<
        "from" | "to" | null
    >(null);
    const [searchQuery, setSearchQuery] = useState("");

    const swapTerminal = useSwapTerminal();

    const handleSelectToken = useCallback(
        (token: TokenOption) => {
            const side = tokenSearchOpen;
            if (!side) return;

            swapTerminal.handleSelectToken(token, side);
            setTokenSearchOpen(null);
            setSearchQuery("");
        },
        [tokenSearchOpen, swapTerminal]
    );

    const handleTokenSearchOpen = useCallback((side: "from" | "to") => {
        setTokenSearchOpen(side);
        setSearchQuery("");
    }, []);

    return (
        <>
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className="cursor-pointer size-12 lg:size-14 rounded-full shadow-lg hover:shadow-xl hover:scale-110 hover:translate-y-[-1rem] transition-all duration-300 bg-primary hover:bg-primary/90 animate-in fade-in zoom-in"
            >
                <ArrowLeftRight className="size-5" />
            </Button>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <SwapDialogContent
                    fromToken={swapTerminal.fromToken}
                    toToken={swapTerminal.toToken}
                    fromAmount={swapTerminal.fromAmount}
                    toAmount={swapTerminal.toAmount}
                    fromBalanceDisplay={swapTerminal.fromBalanceDisplay}
                    toBalanceDisplay={swapTerminal.toBalanceDisplay}
                    usdValueIn={swapTerminal.usdValueIn}
                    usdValueOut={swapTerminal.usdValueOut}
                    isLoadingQuote={swapTerminal.isLoadingQuote}
                    isSwapping={swapTerminal.isSwapping}
                    isConnected={swapTerminal.isConnected}
                    slippage={swapTerminal.slippage}
                    isValidAmount={swapTerminal.isValidAmount}
                    toAmountPriceDisplay={swapTerminal.toAmountPriceDisplay}
                    onFromAmountChange={swapTerminal.setFromAmount}
                    onTokenSelect={handleTokenSearchOpen}
                    onSwapTokens={swapTerminal.handleSwapTokens}
                    onSwap={swapTerminal.handleSwap}
                    onMaxClick={swapTerminal.handleMaxClick}
                    onSettingsClick={() => setSettingsOpen(true)}
                />
            </Dialog>
            <SlippageSettingsDialog
                open={settingsOpen}
                onOpenChange={setSettingsOpen}
                slippage={swapTerminal.slippage}
                onSlippageChange={swapTerminal.setSlippage}
            />
            <TokenSearchDialog
                open={tokenSearchOpen !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setTokenSearchOpen(null);
                        setSearchQuery("");
                    }
                }}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSelectToken={handleSelectToken}
                fromToken={swapTerminal.fromToken}
                toToken={swapTerminal.toToken}
            />
        </>
    );
};

export default SwapTerminal;
