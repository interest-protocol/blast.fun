"use client"

import { PoolWithMetadata } from "@/types/pool"
import { formatDistanceToNow } from "date-fns"
import { Skull, Activity, ExternalLink } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTrades } from "@/hooks/pump/use-trades"
import { formatAddress } from "@mysten/sui/utils"
import { getTxExplorerUrl } from "@/utils/transaction"

interface TradesTabProps {
	pool: PoolWithMetadata
}

interface Trade {
	time: string
	type: "BUY" | "SELL"
	price: string
	volume: string
	trader: string
	kind: string
	quoteAmount: string
	coinAmount: string
	digest: string
}

export function TradesTab({ pool }: TradesTabProps) {
	const { data, isLoading, error } = useTrades({
		coinType: pool.coinType,
		pageSize: 50,
	})

	const formatTimeAgo = (timestamp: string) => {
		const date = new Date(parseInt(timestamp))
		return formatDistanceToNow(date, { addSuffix: true })
	}

	if (isLoading) {
		return (
			<div className="p-4 space-y-1">
				{Array.from({ length: 15 }).map((_, i) => (
					<div
						key={i}
						className="h-12 bg-background/30 rounded animate-pulse border border-border/30"
					/>
				))}
			</div>
		)
	}

	if (error) {
		return (
			<div className="p-8 text-center">
				<Skull className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
				<p className="font-mono text-sm uppercase text-destructive">ERROR::LOADING::TRADES</p>
				<p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">CHECK_CONNECTION</p>
			</div>
		)
	}

	const trades = data?.trades || []

	return (
		<ScrollArea className="h-[500px]">
			<div className="p-4">
				{trades.length === 0 ? (
					<div className="text-center py-12">
						<Activity className="w-12 h-12 mx-auto text-foreground/20 mb-4 animate-pulse" />
						<p className="font-mono text-sm uppercase text-muted-foreground">
							AWAITING::TRADES
						</p>
						<p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">
							BE_THE_FIRST_TO_TRADE
						</p>
					</div>
				) : (
					<div className="space-y-1">
						{/* Header */}
						<div className="grid grid-cols-10 gap-2 px-3 py-2 text-xs font-mono uppercase text-muted-foreground/60 border-b border-border/30">
							<div className="col-span-2">TIME</div>
							<div className="col-span-1">TYPE</div>
							<div className="col-span-3">AMOUNT</div>
							<div className="col-span-4">TRADER</div>
						</div>

						{/* Trades */}
						{trades.map((trade: Trade) => {
							const isBuy = trade.kind.toLowerCase() === "buy"
							const timeAgo = formatTimeAgo(trade.time)
							const decimals = pool.coinMetadata?.decimals || 9
							const tokenAmount = parseFloat(trade.coinAmount) / Math.pow(10, decimals)
							const formattedAmount = tokenAmount < 1
								? tokenAmount.toFixed(6)
								: tokenAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })

							return (
								<div
									key={trade.digest}
									className="group grid grid-cols-10 gap-2 px-3 py-2 hover:bg-background/50 rounded transition-all duration-200 items-center"
								>
									{/* Time */}
									<div className="col-span-2">
										<a
											href={getTxExplorerUrl(trade.digest)}
											target="_blank"
											rel="noopener noreferrer"
											className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors"
										>
											{timeAgo}
										</a>
									</div>

									{/* Type */}
									<div className="col-span-1">
										<div className={`font-mono text-xs uppercase font-semibold ${isBuy ? 'text-green-500' : 'text-red-500'
											}`}>
											{isBuy ? 'BUY' : 'SELL'}
										</div>
									</div>

									{/* Amount */}
									<div className="col-span-3 font-mono text-xs text-foreground/80">
										{formattedAmount} {pool.coinMetadata?.symbol || "TOKEN"}
									</div>

									{/* Trader */}
									<div className="col-span-4 flex items-center gap-1">
										<span className="font-mono text-xs text-muted-foreground">
											{formatAddress(trade.trader)}
										</span>
										<a
											href={`https://suivision.xyz/account/${trade.trader}`}
											target="_blank"
											rel="noopener noreferrer"
											className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-primary"
										>
											<ExternalLink className="h-3 w-3" />
										</a>
									</div>
								</div>
							)
						})}
					</div>
				)}
			</div>
		</ScrollArea>
	)
}