import { FC } from "react"

import { formatNumberWithSuffix, formatAmountWithSuffix } from "@/utils/format"
import { TopStatsProps } from "./top-stats.types"

const TopStats: FC<TopStatsProps> = ({
    marketCap,
    liquidity,
    bondingProgress,
    holdersCount,
    isMarketDataLoaded,
    quoteBalance
}) => (
    <div className="border-b border-border">
        <div className="grid grid-cols-4 divide-x divide-border">
            <div className="p-3 text-center">
                <p className="font-mono text-[10px] uppercase text-muted-foreground mb-1">Market Cap</p>
                <p className="font-mono text-sm font-bold text-green-500">
                    ${formatNumberWithSuffix(marketCap)}
                </p>
            </div>

            <div className="p-3 text-center">
                <p className="font-mono text-[10px] uppercase text-muted-foreground mb-1">Liquidity</p>
                <p className="font-mono text-sm font-bold text-blue-500">
                    {isMarketDataLoaded
                        ? `$${formatNumberWithSuffix(liquidity)}`
                        : `${formatAmountWithSuffix(quoteBalance)} SUI`
                    }
                </p>
            </div>

            <div className="p-3 text-center">
                <p className="font-mono text-[10px] uppercase text-muted-foreground mb-1">Progress</p>
                <div className="flex items-center gap-1.5 justify-center">
                    <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                            style={{ width: `${bondingProgress}%` }}
                        />
                    </div>

                    <p className="font-mono text-sm font-bold text-purple-500">
                        {bondingProgress.toFixed(0)}%
                    </p>
                </div>
            </div>

            <div className="p-3 text-center">
                <p className="font-mono text-[10px] uppercase text-muted-foreground mb-1">Holders</p>
                <p className="font-mono text-sm font-bold text-orange-500">
                    {holdersCount}
                </p>
            </div>
        </div>
    </div>
)

export default TopStats
