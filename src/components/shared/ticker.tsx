"use client"

import { formatAddress } from "@mysten/sui/utils"
import { AlertTriangle } from "lucide-react"
import React, { useEffect, useState, useMemo } from "react"
import { useRecentTrades } from "@/hooks/pump/use-recent-trades"
import type { Trade } from "@/lib/pump/fetch-trades"
import { apolloClient } from "@/lib/apollo-client"
import { fetchCoinMetadata } from "@/lib/fetch-coin-metadata"
import { formatMistToSui } from "@/utils/format"
import { TokenLink } from "@/components/tokens/token-link"
import { GET_POOL_BY_COIN_TYPE } from "@/graphql/pools"

interface TradeItemWithMetadata {
	text: string
	isBuy: boolean
	iconUrl?: string
	symbol: string
	poolId?: string
	coinType: string
}

export function Ticker() {
	const { data, isLoading } = useRecentTrades({ pageSize: 10 })
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
					let poolId: string | undefined

					// fetch coin metadata and pool if we have a coin type
					if (trade.type && trade.type !== "BUY" && trade.type !== "SELL") {
						try {
							const metadata = await fetchCoinMetadata(trade.type)
							if (metadata) {
								symbol = metadata.symbol
								iconUrl = metadata.iconUrl ?? undefined
							}

							// fetch pool id based on the coin type
							try {
								const { data } = await apolloClient.query({
									query: GET_POOL_BY_COIN_TYPE,
									variables: { coinType: trade.type },
									errorPolicy: "ignore",
								})
								poolId = data?.coinPool?.poolId
							} catch (poolError) {
								console.debug("Pool not found for coin type:", trade.type)
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
						poolId,
						coinType: trade.type,
					}
				})
			)

			setTradeItems(enrichedTrades)
		}

		enrichTradesWithMetadata()
	}, [trades])

	const displayItems = useMemo(() => tradeItems, [tradeItems])
	
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
					{displayItems.map((item, index) => (
						<span
							key={index}
							className="mx-8 font-mono text-xs uppercase tracking-wider text-foreground/80 flex items-center gap-2"
						>
							<span className={item.isBuy ? "text-green-500/80" : "text-red-500/80"}>
								{item.isBuy ? "↑" : "↓"}
							</span>
							<span className="text-foreground/60">{item.text}</span>
							<TokenLink iconUrl={item.iconUrl} symbol={item.symbol} poolId={item.poolId} />
						</span>
					))}
				</div>

				<div className="flex animate-ticker whitespace-nowrap" aria-hidden="true">
					{displayItems.map((item, index) => (
						<span
							key={`duplicate-${index}`}
							className="mx-8 font-mono text-xs uppercase tracking-wider text-foreground/80 flex items-center gap-2"
						>
							<span className={item.isBuy ? "text-green-500/80" : "text-red-500/80"}>
								{item.isBuy ? "↑" : "↓"}
							</span>
							<span className="text-foreground/60">{item.text}</span>
							<TokenLink iconUrl={item.iconUrl} symbol={item.symbol} poolId={item.poolId} />
						</span>
					))}
				</div>
			</div>
		</div>
	)
}
