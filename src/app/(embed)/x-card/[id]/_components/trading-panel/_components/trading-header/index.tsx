
import { FC } from "react"

import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { TradingHeaderProps } from "./trading-header.types"

const TradingHeader: FC<TradingHeaderProps> = ({ symbol, refCode, hasBalance, balance }) => (
    
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className="font-mono text-xs font-bold uppercase">
                Trade {symbol}
            </div>
            {refCode && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-blue-400/50 bg-blue-400/10 cursor-help">
                            <div className="w-1 h-1 bg-blue-400 rounded-full" />
                            <span className="font-mono text-[10px] uppercase text-blue-400">
                                {refCode}
                            </span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        The owner of this referral link will earn a commission.
                    </TooltipContent>
                </Tooltip>
            )}
        </div>

        {hasBalance && (
            <div className="font-mono text-xs text-muted-foreground">
                Balance:{" "}
                <span className="text-foreground font-semibold">
                    {balance.toFixed(2)}
                </span>
            </div>
        )}
    </div>
)

export default TradingHeader
