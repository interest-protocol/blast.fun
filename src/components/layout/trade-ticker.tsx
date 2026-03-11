"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { formatNumberWithSuffix } from "@/utils/format"
import { cn } from "@/utils"
import { fetchTrendingCoins, type TrendingCoin } from "@/lib/fetch-trending-coins"

type TickerItem = TrendingCoin & { id: string }

export function TradeTicker() {
	const [items, setItems] = useState<TickerItem[]>([])
	const scrollRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		let cancelled = false

		const loadTrending = async () => {
			try {
				const coins = await fetchTrendingCoins("24h", 20)
				if (!coins.length || cancelled) return

				const mapped: TickerItem[] = coins.map((coin, index) => ({
					id: `${coin.coinType}-${index}`,
					...coin,
				}))

				setItems(mapped)
			} catch {
				// fail silently
			}
		}

		loadTrending()
		const interval = setInterval(loadTrending, 60_000)

		return () => {
			cancelled = true
			clearInterval(interval)
		}
	}, [])

	if (!items.length) {
		return null
	}

	return (
		<div className="relative h-full w-full overflow-hidden flex items-center">
			<div className="ticker-wrapper h-full">
				<div
					ref={scrollRef}
					className="ticker-content h-full flex items-center"
				>
					{[...items, ...items].map((item, index) => {
						const change = item.priceChange1d
						const isUp = change >= 0
						return (
							<Link
								key={`${item.id}-${index}`}
								href={`/token/${item.coinType}`}
								className="ticker-item inline-flex items-center gap-2 px-4 h-full hover:bg-accent/30 transition-colors whitespace-nowrap"
							>
								<span className="font-bold text-xs font-mono">
									{item.symbol}
								</span>
								<span
									className={cn(
										"text-xs font-medium font-mono",
										isUp ? "text-green-500" : "text-red-500"
									)}
								>
									{isUp ? "▲" : "▼"} {change.toFixed(2)}%
								</span>
								<span className="text-xs font-bold text-muted-foreground font-mono">
									Vol {formatNumberWithSuffix(item.volume24h)} SUI 24h
								</span>
							</Link>
						)
					})}
				</div>
			</div>

			{/* overlays */}
			<div className="pointer-events-none absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-background to-transparent z-10" />
			<div className="pointer-events-none absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-background to-transparent z-10" />
		</div>
	)
}