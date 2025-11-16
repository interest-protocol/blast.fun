"use client";

import { FC } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/utils";
import type { SwapActionButtonProps } from "./swap-terminal.types";

export const SwapActionButton: FC<SwapActionButtonProps> = ({
    fromToken,
    toToken,
    fromAmount,
    isSwapping,
    isLoadingQuote,
    isConnected,
    isValidAmount,
    onClick,
}) => {
    const isDisabled =
        !fromToken ||
        !toToken ||
        !fromAmount ||
        isSwapping ||
        isLoadingQuote ||
        !isValidAmount;

    return (
        <Button
            onClick={onClick}
            disabled={isDisabled}
            className={cn(
                "w-full h-10 font-mono text-xs uppercase",
                "bg-green-400/50 hover:bg-green-500/90 text-foreground",
                isDisabled && "opacity-50"
            )}
        >
            {isSwapping ? (
                <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                    Swapping...
                </>
            ) : isLoadingQuote ? (
                <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                    Getting quotes...
                </>
            ) : !isConnected ? (
                "Connect Wallet"
            ) : (
                `Swap ${fromToken?.symbol || ""} for ${toToken?.symbol || ""}`
            )}
        </Button>
    );
};

