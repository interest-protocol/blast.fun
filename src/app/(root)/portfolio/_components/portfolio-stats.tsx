"use client"

import { Coins, DollarSign, TrendingDown, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"
import { formatNumber } from "@/lib/format"
import type { PortfolioResponse } from "@/types/portfolio"
import { cn } from "@/utils"

interface PortfolioStatsProps {
	portfolio: PortfolioResponse
}

export function PortfolioStats({ portfolio }: PortfolioStatsProps) {
	const totalValue = portfolio.balances.reduce((sum, item) => sum + (item.value || 0), 0)
	const totalPnl = portfolio.balances.reduce((sum, item) => sum + (item.unrealizedPnl || 0), 0)
	const totalInvested = portfolio.balances.reduce((sum, item) => sum + (item.value || 0) - (item.unrealizedPnl || 0), 0)
	const totalPnlPercentage = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0
	const totalHoldings = portfolio.balances.length

	return (
		<div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-4">
			{/* Total Value Card */}
			<Card className="border-2 bg-background/50 p-3 backdrop-blur-sm md:p-6">
				<div className="flex flex-col md:flex-row md:items-start md:justify-between">
					<div className="space-y-1 md:space-y-2">
						<div className="flex items-center justify-between md:block">
							<p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider md:text-xs">
								TOTAL VALUE
							</p>
							<DollarSign className="h-4 w-4 text-muted-foreground md:hidden md:h-5 md:w-5" />
						</div>
						<p className="font-bold font-mono text-base text-foreground/80 md:text-2xl">
							${formatNumber(totalValue)}
						</p>
					</div>
					<DollarSign className="hidden h-5 w-5 text-muted-foreground md:block" />
				</div>
			</Card>

			{/* Total PNL Card */}
			<Card className="border-2 bg-background/50 p-3 backdrop-blur-sm md:p-6">
				<div className="flex flex-col md:flex-row md:items-start md:justify-between">
					<div className="space-y-1 md:space-y-2">
						<div className="flex items-center justify-between md:block">
							<p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider md:text-xs">
								TOTAL PNL
							</p>
							{totalPnl >= 0 ? (
								<TrendingUp
									className={cn(
										"h-4 w-4 md:hidden md:h-5 md:w-5",
										totalPnl >= 0 ? "text-green-500" : "text-destructive"
									)}
								/>
							) : (
								<TrendingDown
									className={cn(
										"h-4 w-4 md:hidden md:h-5 md:w-5",
										totalPnl >= 0 ? "text-green-500" : "text-destructive"
									)}
								/>
							)}
						</div>
						<div className="flex items-center gap-2 md:block md:space-y-1">
							<p
								className={cn(
									"font-bold font-mono text-base md:text-2xl",
									totalPnl >= 0 ? "text-green-500" : "text-destructive"
								)}
							>
								${formatNumber(Math.abs(totalPnl))}
							</p>
							<p
								className={cn(
									"font-mono text-xs md:text-sm",
									totalPnl >= 0 ? "text-green-500" : "text-destructive"
								)}
							>
								{totalPnlPercentage >= 0 ? "+" : ""}
								{totalPnlPercentage.toFixed(2)}%
							</p>
						</div>
					</div>
					{totalPnl >= 0 ? (
						<TrendingUp
							className={cn("hidden h-5 w-5 md:block", totalPnl >= 0 ? "text-green-500" : "text-destructive")}
						/>
					) : (
						<TrendingDown
							className={cn("hidden h-5 w-5 md:block", totalPnl >= 0 ? "text-green-500" : "text-destructive")}
						/>
					)}
				</div>
			</Card>

			{/* Holdings Card - Hidden on mobile */}
			<Card className="hidden border-2 bg-background/50 p-3 backdrop-blur-sm md:block md:p-6">
				<div className="flex flex-col md:flex-row md:items-start md:justify-between">
					<div className="space-y-1 md:space-y-2">
						<p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider md:text-xs">
							HOLDINGS
						</p>
						<p className="font-bold font-mono text-base text-foreground/80 md:text-2xl">{totalHoldings}</p>
					</div>
					<Coins className="hidden h-5 w-5 text-muted-foreground md:block" />
				</div>
			</Card>
		</div>
	)
}
