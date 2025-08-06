"use client"

import type { PoolWithMetadata } from "@/types/pool"
import { formatAmountWithSuffix, formatNumberWithSuffix } from "@/utils/format"
import { useMarketData } from "@/hooks/use-market-data"

interface MarketStatsProps {
	pool: PoolWithMetadata
}

export function MarketStats({ pool }: MarketStatsProps) {
	const { data: marketData } = useMarketData(pool.coinType)
	
	const bondingProgress = parseFloat(pool.bondingCurve)
	const marketCap = marketData?.marketCap || 0
	const totalLiquidity = marketData?.totalLiquidityUsd || 0

	return (
		<div className="border-b border-foreground/20 bg-foreground/5 py-2">
			<div className="grid grid-cols-3 select-none">
				<div className="flex items-center justify-center border-r border-foreground/20">
					<div className="text-center">
						<p className="font-mono text-[10px] uppercase text-muted-foreground">MARKET::CAP</p>
						<p className="font-mono text-xs font-bold text-foreground/80">
							{marketData ? `$${formatNumberWithSuffix(marketCap)}` : "[LOADING]"}
						</p>
					</div>
				</div>
				<div className="flex items-center justify-center border-r border-foreground/20">
					<div className="text-center">
						<p className="font-mono text-[10px] uppercase text-muted-foreground">LIQUIDITY::USD</p>
						<p className="font-mono text-xs font-bold text-foreground/80">
							{marketData ? `$${formatNumberWithSuffix(totalLiquidity)}` : `${formatAmountWithSuffix(pool.quoteBalance)} SUI`}
						</p>
					</div>
				</div>
				<div className="flex items-center justify-center">
					<div className="text-center">
						<p className="font-mono text-[10px] uppercase text-muted-foreground">BONDING::CURVE</p>
						<div className="flex items-center gap-1 justify-center">
							<div className="w-16 h-1.5 bg-foreground/20 rounded-full overflow-hidden">
								<div
									className="h-full bg-primary transition-all"
									style={{ width: `${bondingProgress}%` }}
								/>
							</div>
							<p className="font-mono text-xs font-bold text-foreground/80">
								{bondingProgress.toFixed(0)}%
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}