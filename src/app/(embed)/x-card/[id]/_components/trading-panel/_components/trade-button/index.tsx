"use client"

import { FC } from "react"
import { Zap, Loader2 } from "lucide-react"

import { cn } from "@/utils"
import { Button } from "@/components/ui/button"
import { TradeButtonProps } from "./trade-button.types"

const TradeButton: FC<TradeButtonProps> = ({
    tradeType,
    amount,
    isProcessing,
    symbol,
    hasBalance,
    handleTrade
}) => (
    <Button
        className={cn(
            "w-full font-mono uppercase text-xs h-9",
            tradeType === "buy"
                ? "bg-green-400/50 hover:bg-green-500/90 text-foreground"
                : "bg-destructive/80 hover:bg-destructive text-foreground",
            (!amount || isProcessing) && "opacity-50"
        )}
        onClick={handleTrade}
        disabled={!amount || isProcessing || (tradeType === "sell" && !hasBalance)}
    >
        {isProcessing ? (
            <span className="flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Processing
            </span>
        ) : (
            <span className="flex items-center gap-1.5">
                <Zap className="w-3 h-3" />
                {tradeType === "buy" ? "Buy" : "Sell"} {symbol}
            </span>
        )}
    </Button>
)

export default TradeButton
