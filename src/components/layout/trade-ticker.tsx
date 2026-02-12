"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { formatNumberWithSuffix } from "@/utils/format"
import { cn } from "@/utils"

type TrendingItem = {
	coin_type: string
	symbol: string
	name: string
	logo?: string
	price: number
	price_change_1d?: number
	price_change_6h?: number
	price_change_1h?: number
	price_change_30m?: number
	volume_24h?: number
	market_cap?: string
	rank?: number
}

export function TradeTicker() {
	const [items, setItems] = useState<TrendingItem[]>([])
	const [period] = useState<"24h" | "6h" | "1h">("24h")

	useEffect(() => {
		const controller = new AbortController()
		const load = async () => {
			try {
				const res = await fetch(
					`/api/tokens/trending?period=${period}&limit=25`,
					{ signal: controller.signal }
				)
				if (!res.ok) return
				const data = (await res.json()) as TrendingItem[]
				if (Array.isArray(data) && data.length > 0) setItems(data)
			} catch (e) {
				if ((e as Error).name !== "AbortError") console.error("Trending ticker:", e)
			}
		}
		load()
		return () => controller.abort()
	}, [period])

	const priceChange = (item: TrendingItem) => {
		const v = item.price_change_1d ?? item.price_change_6h ?? item.price_change_1h ?? item.price_change_30m ?? 0
		return v
	}

	if (items.length === 0) {
		return (
			<div className="relative h-full w-full flex items-center overflow-hidden">
				<p className="font-mono text-xs text-muted-foreground px-4">Loading trends…</p>
			</div>
		)
	}

	const duplicated = [...items, ...items]

	return (
		<div className="relative h-full w-full overflow-hidden flex items-center">
			<div className="ticker-wrapper h-full">
				<div className="ticker-content h-full flex items-center">
					{duplicated.map((item, index) => {
						const change = priceChange(item)
						const isUp = change >= 0
						return (
							<Link
								key={`${item.coin_type}-${index}`}
								href={`/token/${encodeURIComponent(item.coin_type)}`}
								className="ticker-item inline-flex items-center gap-2 px-4 h-full hover:bg-accent/30 transition-colors whitespace-nowrap"
							>
								<span className="font-bold text-xs font-mono">{item.symbol}</span>
								<span
									className={cn(
										"text-xs font-medium font-mono",
										isUp ? "text-green-500" : "text-red-500"
									)}
								>
									{isUp ? "↑" : "↓"} {isUp ? "+" : ""}{change.toFixed(2)}%
								</span>
								{item.price > 0 && (
									<span className="text-xs text-muted-foreground font-mono">
										${formatNumberWithSuffix(item.price)}
									</span>
								)}
							</Link>
						)
					})}
				</div>
			</div>
			<div className="pointer-events-none absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-background to-transparent z-10" />
			<div className="pointer-events-none absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-background to-transparent z-10" />
		</div>
	)
}
