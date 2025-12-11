"use client"

import { FC } from "react"

import { cn } from "@/utils"
import { Button } from "@/components/ui/button"
import { TradeTabsProps } from "./trade-tabs.types"

const TradeTabs: FC<TradeTabsProps> = ({ tradeType, setTradeType, hasBalance }) => (
    <div className="flex gap-1 p-0.5 bg-muted rounded-md">
        <Button
            variant={tradeType === "buy" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTradeType("buy")}
            className={cn(
                "flex-1 font-mono text-xs uppercase h-7",
                tradeType === "buy"
                    ? "bg-green-500/80 hover:bg-green-500 text-white shadow-none"
                    : "hover:bg-transparent hover:text-foreground text-muted-foreground"
            )}
        >
            Buy
        </Button>

        <Button
            variant={tradeType === "sell" ? "destructive" : "ghost"}
            size="sm"
            onClick={() => setTradeType("sell")}
            disabled={!hasBalance}
            className={cn(
                "flex-1 font-mono text-xs uppercase h-7",
                tradeType === "sell"
                    ? "bg-destructive/80 hover:bg-destructive text-white shadow-none"
                    : "hover:bg-transparent hover:text-foreground text-muted-foreground"
            )}
        >
            Sell
        </Button>
    </div>
)

export default TradeTabs
