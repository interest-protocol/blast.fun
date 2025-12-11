"use client"

import { FC } from "react"

import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover"
import { cn } from "@/utils"
import { Button } from "@/components/ui/button"
import { AmountInputProps } from "./amount-input.types"

const AmountInput: FC<AmountInputProps> = ({
    amount,
    setAmount,
    isProcessing,
    tradeType,
    symbol,
    slippage,
    setSlippage
}) => (
    <div className="flex gap-1">
        <div className="relative flex-1">
            <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pr-12 h-10 font-mono"
                disabled={isProcessing}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground">
                {tradeType === "buy" ? "SUI" : symbol}
            </span>
        </div>

        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-14 h-10 font-mono text-xs px-2">
                    {slippage}%
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-32 p-2" align="end">
                <div className="space-y-1">
                    {["5", "10", "15", "20"].map((value) => (
                        <button
                            key={value}
                            onClick={() => setSlippage(value)}
                            className={cn(
                                "w-full px-2 py-1.5 rounded font-mono text-xs transition-colors text-left",
                                slippage === value
                                    ? "bg-primary/20 text-primary"
                                    : "hover:bg-accent"
                            )}
                        >
                            {value}% slippage
                        </button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    </div>
)

export default AmountInput
