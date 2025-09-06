"use client"

import { ChartLine, ExternalLink, TrendingUp } from "lucide-react"
import { useState } from "react"
import { NexaChart } from "@/components/shared/nexa-chart"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useMarketData } from "@/hooks/use-market-data"
import type { Token } from "@/types/token"
import { cn } from "@/utils"
import { formatAmountWithSuffix, formatNumberWithSuffix } from "@/utils/format"
import { TradingPanel } from "./trading-panel"

interface XCardTradingProps {
	pool: Token
	referrerWallet?: string | null
	refCode?: string | null
}

export function XCardTrading({ pool, referrerWallet, refCode }: XCardTradingProps) {
	const [activeTab, setActiveTab] = useState<"trade" | "chart">("trade")
	const { data: marketData } = useMarketData(pool.coinType)
	const metadata = pool.metadata

	const bondingProgress = pool.market?.bondingProgress || 0
	const marketCap = marketData?.marketCap || 0
	const totalLiquidity = marketData?.liquidity || 0
	const holdersCount = marketData?.holdersCount || 0

	return (
		<div className="flex h-full flex-col bg-background">
			{activeTab === "trade" && (
				<div className="border-border border-b">
					<div className="grid grid-cols-4 divide-x divide-border">
						<div className="p-3 text-center">
							<p className="mb-1 font-mono text-[10px] text-muted-foreground uppercase">Market Cap</p>
							<p className="font-bold font-mono text-green-500 text-sm">
								${formatNumberWithSuffix(marketCap)}
							</p>
						</div>
						<div className="p-3 text-center">
							<p className="mb-1 font-mono text-[10px] text-muted-foreground uppercase">Liquidity</p>
							<p className="font-bold font-mono text-blue-500 text-sm">
								{marketData
									? `$${formatNumberWithSuffix(totalLiquidity)}`
									: `${formatAmountWithSuffix(pool.pool?.quoteBalance || "0")} SUI`}
							</p>
						</div>
						<div className="p-3 text-center">
							<p className="mb-1 font-mono text-[10px] text-muted-foreground uppercase">Progress</p>
							<div className="flex items-center justify-center gap-1.5">
								<div className="h-1.5 w-12 overflow-hidden rounded-full bg-muted">
									<div
										className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
										style={{ width: `${bondingProgress}%` }}
									/>
								</div>
								<p className="font-bold font-mono text-purple-500 text-sm">{bondingProgress.toFixed(0)}%</p>
							</div>
						</div>
						<div className="p-3 text-center">
							<p className="mb-1 font-mono text-[10px] text-muted-foreground uppercase">Holders</p>
							<p className="font-bold font-mono text-orange-500 text-sm">{holdersCount}</p>
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
						<NexaChart pool={pool} className="h-full w-full" />
					</div>
				)}
			</div>

			{/* Footer */}
			<div className="border-border border-t">
				<div className="space-y-3 p-3">
					<div className="flex gap-2">
						<button
							onClick={() => setActiveTab("trade")}
							className={cn(
								"flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 font-mono text-xs uppercase transition-all",
								activeTab === "trade"
									? "bg-primary text-primary-foreground shadow-sm"
									: "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
							)}
						>
							<TrendingUp className="h-3.5 w-3.5" />
							Trade
						</button>
						<button
							onClick={() => setActiveTab("chart")}
							className={cn(
								"flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 font-mono text-xs uppercase transition-all",
								activeTab === "chart"
									? "bg-primary text-primary-foreground shadow-sm"
									: "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
							)}
						>
							<ChartLine className="h-3.5 w-3.5" />
							Chart
						</button>
					</div>

					{/* Token Info */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2.5">
							<Avatar className="h-9 w-9 rounded-lg border-2">
								<AvatarImage src={metadata?.icon_url || ""} alt={metadata?.symbol} />
								<AvatarFallback className="rounded-none font-mono text-xs uppercase">
									{metadata?.symbol?.slice(0, 2) || "??"}
								</AvatarFallback>
							</Avatar>
							<div className="flex flex-col">
								<h1 className="font-bold font-mono text-xs uppercase">{metadata?.name || "[UNNAMED]"}</h1>
								<p className="font-mono text-[10px] text-muted-foreground">{metadata?.symbol || "[???]"}</p>
							</div>
						</div>
						<Button
							variant="outline"
							size="sm"
							className="h-7 font-mono text-xs"
							onClick={() => {
								const url = refCode
									? `${window.location.origin}/token/${pool.coinType}?ref=${refCode}`
									: `${window.location.origin}/token/${pool.coinType}`
								window.open(url, "_blank")
							}}
						>
							<ExternalLink className="mr-1 h-3 w-3" />
							VIEW ON BLAST
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}
