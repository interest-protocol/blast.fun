"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import tradeBumpSocket, { type TradeEvent } from "@/lib/websocket/trade-bump-socket"
import { formatNumberWithSuffix, formatAddressShort } from "@/utils/format"
import { cn } from "@/utils"
import { useRecentTrades } from "@/hooks/pump/use-recent-trades"

type TickerItem = {
	id: string
	coinType: string
	name: string
	symbol: string
	kind: "buy" | "sell"
	amount: number
	trader: string
	timestamp: number
}

export function TradeTicker() {
	const [trades, setTrades] = useState<TickerItem[]>([])
	const scrollRef = useRef<HTMLDivElement>(null)

	// seed initial trades from gql
	const { data: initialTrades } = useRecentTrades({ pageSize: 15 })
	useEffect(() => {
		if (initialTrades && initialTrades.length > 0) {
			const seedTrades = initialTrades.map((trade, index) => {
				const parts = trade.type.split("::")
				const quoteAmount = trade.quoteAmount ? parseFloat(trade.quoteAmount) / 1e9 : 0
				return {
					id: `initial-${trade.type}-${index}`,
					coinType: trade.type,
					name: parts[1] || "Unknown",
					symbol: parts[2]?.toUpperCase() || "???",
					kind: trade.kind as "buy" | "sell",
					amount: quoteAmount,
					trader: trade.trader,
					timestamp: new Date(trade.time).getTime()
				}
			})
			setTrades(seedTrades)
		}
	}, [initialTrades])

	useEffect(() => {
		const handleTrade = (trade: TradeEvent) => {
			const parts = trade.type.split("::")
			const newTrade: TickerItem = {
				id: `${trade.type}-${Date.now()}-${Math.random()}`,
				coinType: trade.type,
				name: parts[1] || "Unknown",
				symbol: parts[2]?.toUpperCase() || "???",
				kind: trade.kind,
				amount: trade.quote_amount
					? (typeof trade.quote_amount === 'string'
						? parseFloat(trade.quote_amount) / 1e9
						: trade.quote_amount / 1e9)
					: 0,
				trader: trade.sender,
				timestamp: Date.now()
			}

			setTrades(prev => {
				const updated = [newTrade, ...prev].slice(0, 100)
				return updated
			})
		}

		tradeBumpSocket.subscribeToTradeEvents(handleTrade)

		return () => {
			tradeBumpSocket.unsubscribeFromTradeEvents()
		}
	}, [])

	return (
		<div className="relative h-full w-full overflow-hidden flex items-center">
			<div className="ticker-wrapper h-full">
				<div
					ref={scrollRef}
					className="ticker-content h-full flex items-center"
				>
					{[...trades, ...trades].map((trade, index) => (
						<Link
							key={`${trade.id}-${index}`}
							href={`/token/${trade.coinType?.includes("::") ? encodeURIComponent(trade.coinType) : trade.coinType ?? ""}`}
							className="ticker-item inline-flex items-center gap-2 px-4 h-full hover:bg-accent/30 transition-colors whitespace-nowrap"
						>
							<span className="font-bold text-xs font-mono">{trade.symbol}</span>
							<span className={cn(
								"text-xs font-medium font-mono",
								trade.kind === "buy" ? "text-green-500" : "text-red-500"
							)}>
								{trade.kind === "buy" ? "↑" : "↓"} {formatNumberWithSuffix(trade.amount)} SUI
							</span>
							<span className="text-xs font-bold text-muted-foreground font-mono">
								by {formatAddressShort(trade.trader)}
							</span>
						</Link>
					))}
				</div>
			</div>

			{/* overlays */}
			<div className="pointer-events-none absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-background to-transparent z-10" />
			<div className="pointer-events-none absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-background to-transparent z-10" />
		</div>
	)
}