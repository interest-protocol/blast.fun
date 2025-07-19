"use client"

import { formatAddress } from "@mysten/sui/utils"
import { AlertTriangle } from "lucide-react"
import React, { useEffect, useState } from "react"
import { useRecentTrades } from "@/hooks/pump/use-recent-trades"
import type { Trade } from "@/lib/pump/fetch-trades"
import { suiClient } from "@/lib/sui-client"
import { formatMistToSui } from "@/utils/format"

interface TradeItemWithMetadata {
	text: string
	isBuy: boolean
	iconUrl?: string
	symbol: string
}

function TokenAvatar({ iconUrl, symbol }: { iconUrl?: string; symbol: string }) {
	const [imageError, setImageError] = useState(false)

	if (!iconUrl || imageError) {
		return (
			<div className="w-4 h-4 rounded-full bg-foreground/20 flex items-center justify-center text-[10px] font-bold">
				{symbol[0]?.toUpperCase() || "?"}
			</div>
		)
	}

	return (
		<img
			src={iconUrl}
			alt={symbol}
			className="w-4 h-4 rounded-full"
			onError={() => setImageError(true)}
		/>
	)
}

export function Ticker() {
	const { data, isLoading } = useRecentTrades({ pageSize: 20 })
	const [tradeItems, setTradeItems] = useState<TradeItemWithMetadata[]>([])

	const trades = data || []

	useEffect(() => {
		async function enrichTradesWithMetadata() {
			if (!trades.length) return

			const enrichedTrades = await Promise.all(
				trades.map(async (trade: Trade) => {
					const suiAmount = formatMistToSui(BigInt(trade.quoteAmount))
					const isBuy = trade.kind === "buy"
					const action = isBuy ? "BOUGHT" : "SOLD"
					const formattedAddress = formatAddress(trade.trader)

					let symbol = "[UNKNOWN]"
					let iconUrl: string | undefined

					// fetch coin metadata if we have a coin type
					if (trade.type && trade.type !== "BUY" && trade.type !== "SELL") {
						try {
							const metadata = await suiClient.getCoinMetadata({ coinType: trade.type })
							if (metadata) {
								symbol = metadata.symbol
								iconUrl = metadata.iconUrl ?? undefined
							}
						} catch (error) {
							console.error("Failed to fetch coin metadata:", error)
						}
					}

					return {
						text: `${formattedAddress} ${action} ${suiAmount} SUI OF`,
						isBuy,
						iconUrl,
						symbol,
					}
				})
			)

			setTradeItems(enrichedTrades)
		}

		enrichTradesWithMetadata()
	}, [trades])

	const displayItems = tradeItems
	if (displayItems.length === 0 && !isLoading) return null

	return (
		<div className="w-full overflow-hidden bg-destructive/10 border-y-2 border-destructive/20 py-2 relative select-none group">
			{/* indicators on edges */}
			<div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-destructive/20 to-transparent z-10 flex items-center justify-start pl-2">
				<AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />
			</div>
			<div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-destructive/20 to-transparent z-10 flex items-center justify-end pr-2">
				<AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />
			</div>

			{/* content */}
			<div className="relative flex">
				<div className="flex animate-ticker whitespace-nowrap">
					{[...displayItems, ...displayItems].map((item, index) => (
						<span
							key={index}
							className="mx-8 font-mono text-sm uppercase tracking-wider text-foreground/80 flex items-center gap-2"
						>
							<span className="text-foreground/60">{item.text}</span>
							<TokenAvatar iconUrl={item.iconUrl} symbol={item.symbol} />
							<span className="text-foreground/60">{item.symbol}</span>
						</span>
					))}
				</div>
				<div className="flex animate-ticker whitespace-nowrap" aria-hidden="true">
					{[...displayItems, ...displayItems].map((item, index) => (
						<span
							key={`duplicate-${index}`}
							className="mx-8 font-mono text-sm uppercase tracking-wider text-foreground/80 flex items-center gap-2"
						>
							<span className="text-destructive/60">ALERT::</span>
							<span className="text-foreground/60">{item.text}</span>
							<TokenAvatar iconUrl={item.iconUrl} symbol={item.symbol} />
							<span className="text-foreground/60">{item.symbol}</span>
						</span>
					))}
				</div>
			</div>
		</div>
	)
}
