"use client"

import { Card } from "@/components/ui/card"
import type { PortfolioResponse } from "@/types/portfolio"
import { formatNumber } from "@/lib/format"
import { TrendingUp, TrendingDown, DollarSign, Coins } from "lucide-react"
import { cn } from "@/utils"

interface PortfolioStatsProps {
	portfolio: PortfolioResponse
}

export function PortfolioStats({ portfolio }: PortfolioStatsProps) {
	const totalValue = portfolio.balances.reduce((sum, item) => sum + (item.value || 0), 0)
	const totalPnl = portfolio.balances.reduce((sum, item) => sum + (item.unrealizedPnl || 0), 0)
	const totalInvested = portfolio.balances.reduce((sum, item) => 
		sum + (item.value || 0) - (item.unrealizedPnl || 0), 0
	)
	const totalPnlPercentage = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0
	const totalHoldings = portfolio.balances.length

	return (
		<div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
			{/* Total Value Card */}
			<Card className="p-3 md:p-6 border-2 bg-background/50 backdrop-blur-sm">
				<div className="flex flex-col md:flex-row md:items-start md:justify-between">
					<div className="space-y-1 md:space-y-2">
						<div className="flex items-center justify-between md:block">
							<p className="font-mono text-[10px] md:text-xs uppercase tracking-wider text-muted-foreground">
								TOTAL VALUE
							</p>
							<DollarSign className="h-4 w-4 md:h-5 md:w-5 md:hidden text-muted-foreground" />
						</div>
						<p className="font-mono text-base md:text-2xl font-bold text-foreground/80">
							${formatNumber(totalValue)}
						</p>
					</div>
					<DollarSign className="hidden md:block h-5 w-5 text-muted-foreground" />
				</div>
			</Card>

			{/* Total PNL Card */}
			<Card className="p-3 md:p-6 border-2 bg-background/50 backdrop-blur-sm">
				<div className="flex flex-col md:flex-row md:items-start md:justify-between">
					<div className="space-y-1 md:space-y-2">
						<div className="flex items-center justify-between md:block">
							<p className="font-mono text-[10px] md:text-xs uppercase tracking-wider text-muted-foreground">
								TOTAL PNL
							</p>
							{totalPnl >= 0 ? (
								<TrendingUp className={cn("h-4 w-4 md:h-5 md:w-5 md:hidden", totalPnl >= 0 ? "text-green-500" : "text-destructive")} />
							) : (
								<TrendingDown className={cn("h-4 w-4 md:h-5 md:w-5 md:hidden", totalPnl >= 0 ? "text-green-500" : "text-destructive")} />
							)}
						</div>
						<div className="flex items-center gap-2 md:block md:space-y-1">
							<p className={cn("font-mono text-base md:text-2xl font-bold", totalPnl >= 0 ? "text-green-500" : "text-destructive")}>
								${formatNumber(Math.abs(totalPnl))}
							</p>
							<p className={cn("font-mono text-xs md:text-sm", totalPnl >= 0 ? "text-green-500" : "text-destructive")}>
								{totalPnlPercentage >= 0 ? "+" : ""}{totalPnlPercentage.toFixed(2)}%
							</p>
						</div>
					</div>
					{totalPnl >= 0 ? (
						<TrendingUp className={cn("hidden md:block h-5 w-5", totalPnl >= 0 ? "text-green-500" : "text-destructive")} />
					) : (
						<TrendingDown className={cn("hidden md:block h-5 w-5", totalPnl >= 0 ? "text-green-500" : "text-destructive")} />
					)}
				</div>
			</Card>

			{/* Holdings Card - Hidden on mobile */}
			<Card className="hidden md:block p-3 md:p-6 border-2 bg-background/50 backdrop-blur-sm">
				<div className="flex flex-col md:flex-row md:items-start md:justify-between">
					<div className="space-y-1 md:space-y-2">
						<p className="font-mono text-[10px] md:text-xs uppercase tracking-wider text-muted-foreground">
							HOLDINGS
						</p>
						<p className="font-mono text-base md:text-2xl font-bold text-foreground/80">
							{totalHoldings}
						</p>
					</div>
					<Coins className="hidden md:block h-5 w-5 text-muted-foreground" />
				</div>
			</Card>
		</div>
	)
}