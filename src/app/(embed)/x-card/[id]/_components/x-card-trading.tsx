"use client"

import { useState } from "react"
import type { PoolWithMetadata } from "@/types/pool"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { MarketStats } from "./market-stats"
import { TradingPanel } from "./trading-panel"
import { EmbedChart } from "./embed-chart"
import { cn } from "@/utils"

interface XCardTradingProps {
	pool: PoolWithMetadata
	referrerWallet?: string | null
	refCode?: string | null
}

export function XCardTrading({ pool, referrerWallet }: XCardTradingProps) {
	const [showChart, setShowChart] = useState(false)

	return (
		<div className="relative flex-1 bg-background text-foreground flex flex-col">
			<MarketStats pool={pool} />

			<div className="flex items-center justify-between px-3 py-2 border-b border-foreground/10">
				<h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground select-none">
					{showChart ? "CHART::VIEW" : "TRADE::TERMINAL"}
				</h2>
				<div className="flex items-center p-1 bg-foreground/5 rounded-md">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setShowChart(false)}
						className={cn(
							"h-7 px-3 font-mono text-[11px] uppercase tracking-wide transition-all rounded hover:bg-transparent",
							!showChart
								? "bg-background text-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground/80"
						)}
					>
						TRADE
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setShowChart(true)}
						className={cn(
							"h-7 px-3 font-mono text-[11px] uppercase tracking-wide transition-all rounded hover:bg-transparent",
							showChart
								? "bg-background text-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground/80"
						)}
					>
						CHART
					</Button>
				</div>
			</div>

			<div className="flex-1 flex">
				{showChart ? (
					<div className="flex-1 flex flex-col p-2">
						<div className="flex-1 min-h-[300px]">
							<EmbedChart pool={pool} />
						</div>
					</div>
				) : (
					<div className="flex-1 flex flex-col">
						<TradingPanel pool={pool} referrerWallet={referrerWallet} />

						<div className="px-3 pb-3">
							<div className="pt-2 border-t border-foreground/20">
								<div className="flex items-center justify-between select-none">
									<div className="flex items-center gap-1.5">
										<Logo className="w-4 h-4 text-foreground/60" />
										<span className="font-mono font-semibold text-xs uppercase text-muted-foreground">
											XCTASY.FUN
										</span>
									</div>
									<span className="font-mono text-xs uppercase text-muted-foreground">
										POWERED BY SUI
									</span>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}