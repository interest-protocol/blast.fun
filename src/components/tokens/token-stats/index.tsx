import { FC, memo } from "react"
import { Users } from "lucide-react"

import { formatNumberWithSuffix } from "@/utils/format"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { TokenStatsProps } from "./token-stats.types"

const TokenStats: FC<TokenStatsProps> = memo(function TokenStats({
    marketCap,
    volume24h,
    holdersCount,
}) {
    return (
        <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono flex-wrap">
            {marketCap > 0 && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-1">
                            <span className="text-muted-foreground/60 uppercase tracking-wider text-[9px] sm:text-[10px]">MC</span>
                            <span className="font-semibold text-green-500/90 text-[11px] sm:text-xs">
                                ${formatNumberWithSuffix(marketCap)}
                            </span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="text-xs font-mono uppercase">MARKET CAP</p>
                    </TooltipContent>
                </Tooltip>
            )}

            {volume24h > 0 && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-1">
                            <span className="text-muted-foreground/60 uppercase tracking-wider text-[9px] sm:text-[10px]">VOL</span>
                            <span className="font-semibold text-purple-500/90 text-[11px] sm:text-xs">
                                ${formatNumberWithSuffix(volume24h)}
                            </span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="text-xs font-mono uppercase">24H VOLUME</p>
                    </TooltipContent>
                </Tooltip>
            )}

            {holdersCount > 0 && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-muted-foreground/60" />
                            <span className="font-semibold text-foreground/70 text-[11px] sm:text-xs">
                                {formatNumberWithSuffix(holdersCount)}
                            </span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="text-xs font-mono uppercase">HOLDERS</p>
                    </TooltipContent>
                </Tooltip>
            )}
        </div>
    );
})

export default TokenStats;