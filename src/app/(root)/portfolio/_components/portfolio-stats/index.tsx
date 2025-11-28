import { FC } from "react"
import { TrendingUp, TrendingDown, DollarSign, Coins } from "lucide-react"

import { cn } from "@/utils"
import { StatCard } from "./stat-card"
import { formatNumber } from "@/lib/format"
import { PortfolioStatsProps } from "./portfolio-stats.types"

const PortfolioStats: FC<PortfolioStatsProps> = ({ portfolio }) => {
    const totalValue = portfolio.balances.reduce((sum, item) => sum + (item.value || 0), 0)
    const totalPnl = portfolio.balances.reduce((sum, item) => sum + (item.unrealizedPnl || 0), 0)
    const totalInvested = portfolio.balances.reduce((sum, item) => sum + (item.value || 0) - (item.unrealizedPnl || 0), 0)
    const totalPnlPercentage = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0
    const totalHoldings = portfolio.balances.length

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
            <StatCard
                title="TOTAL VALUE"
                value={`$${formatNumber(totalValue)}`}
                icon={<DollarSign className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />}
            />

            <StatCard
                title="TOTAL PNL"
                value={`$${formatNumber(Math.abs(totalPnl))}`}
                description={`${totalPnlPercentage >= 0 ? "+" : ""}${totalPnlPercentage.toFixed(2)}%`}
                color={totalPnl >= 0 ? "text-green-500" : "text-destructive"}
                icon={totalPnl >= 0 ? <TrendingUp className={cn("h-4 w-4 md:h-5 md:w-5 text-green-500")} /> :
                    <TrendingDown className={cn("h-4 w-4 md:h-5 md:w-5 text-destructive")} />}
            />

            <StatCard
                title="HOLDINGS"
                value={totalHoldings}
                icon={<Coins className="h-5 w-5 text-muted-foreground" />}
                className="hidden md:block"
            />
        </div>
    )
}

export default PortfolioStats
