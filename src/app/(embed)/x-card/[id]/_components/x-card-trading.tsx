"use client"

import { useState } from "react"
import { ExternalLink, TrendingUp, ChartLine } from "lucide-react"
import type { PoolWithMetadata } from "@/types/pool"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { TradingPanel } from "./trading-panel"
import { NexaChart } from "@/components/shared/nexa-chart"
import { useMarketData } from "@/hooks/use-market-data"
import { formatNumberWithSuffix, formatAmountWithSuffix } from "@/utils/format"
import { cn } from "@/utils"

interface XCardTradingProps {
	pool: PoolWithMetadata
	referrerWallet?: string | null
	refCode?: string | null
}

export function XCardTrading({ pool, referrerWallet, refCode }: XCardTradingProps) {
	const [activeTab, setActiveTab] = useState<"trade" | "chart">("trade")
	const { data: marketData } = useMarketData(pool.coinType)
	const metadata = marketData?.coinMetadata || pool.coinMetadata

	const bondingProgress = pool.bondingCurve
	const marketCap = marketData?.marketCap || 0
	const totalLiquidity = marketData?.liqUsd || 0
	const holdersCount = marketData?.holdersCount || 0

	return (
		<div className="flex flex-col h-full bg-background">
			{activeTab === "trade" && (
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
								{marketData ? `$${formatNumberWithSuffix(totalLiquidity)}` : `${formatAmountWithSuffix(pool.quoteBalance)} SUI`}
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
			)}

			{/* Content */}
			<div className="flex-1 overflow-y-auto">
				{activeTab === "trade" ? (
					<TradingPanel pool={pool} referrerWallet={referrerWallet} refCode={refCode} />
				) : (
					<div className="h-full">
						<NexaChart pool={pool} className="w-full h-full" />
					</div>
				)}
			</div>

			{/* Footer */}
			<div className="border-t border-border">
				<div className="p-3 space-y-3">
					<div className="flex gap-2">
						<button
							onClick={() => setActiveTab("trade")}
							className={cn(
								"flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-mono text-xs uppercase transition-all",
								activeTab === "trade"
									? "bg-primary text-primary-foreground shadow-sm"
									: "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
							)}
						>
							<TrendingUp className="w-3.5 h-3.5" />
							Trade
						</button>
						<button
							onClick={() => setActiveTab("chart")}
							className={cn(
								"flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-mono text-xs uppercase transition-all",
								activeTab === "chart"
									? "bg-primary text-primary-foreground shadow-sm"
									: "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
							)}
						>
							<ChartLine className="w-3.5 h-3.5" />
							Chart
						</button>
					</div>

					{/* Token Info */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2.5">
							<Avatar className="w-9 h-9 rounded-lg border-2">
								<AvatarImage src={metadata?.iconUrl || ""} alt={metadata?.symbol} />
								<AvatarFallback className="font-mono rounded-none text-xs uppercase">
									{metadata?.symbol?.slice(0, 2) || "??"}
								</AvatarFallback>
							</Avatar>
							<div className="flex flex-col">
								<h1 className="font-mono text-xs font-bold uppercase">
									{metadata?.name || "[UNNAMED]"}
								</h1>
								<p className="font-mono text-[10px] text-muted-foreground">
									{metadata?.symbol || "[???]"}
								</p>
							</div>
						</div>
						<Button
							variant="outline"
							size="sm"
							className="font-mono text-xs h-7"
							onClick={() => {
								const url = refCode
									? `${window.location.origin}/token/${pool.poolId}?ref=${refCode}`
									: `${window.location.origin}/token/${pool.poolId}`
								window.open(url, "_blank")
							}}
						>
							<ExternalLink className="w-3 h-3 mr-1" />
							VIEW ON BLAST
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}