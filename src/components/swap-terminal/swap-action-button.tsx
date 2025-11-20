"use client";

import { FC, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/utils";
import type { SwapActionButtonProps } from "./swap-terminal.types";
import { useApp } from "@/context/app.context";

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
    const { setIsConnectDialogOpen } = useApp();

    const handleButtonClick = useCallback(() => {
        if (!isConnected) setIsConnectDialogOpen(true);
        else onClick();
    }, [isConnected, setIsConnectDialogOpen, onClick]);

    const isDisabled =
        isConnected &&
        (!fromToken ||
            !toToken ||
            !fromAmount ||
            isSwapping ||
            isLoadingQuote ||
            !isValidAmount);

    return (
        <Button
            disabled={isDisabled}
            onClick={handleButtonClick}
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
