"use client"

import { Globe, Send, Search } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { PoolWithMetadata } from "@/types/pool"
import { formatNumberWithSuffix } from "@/utils/format"
import { CopyableToken } from "@/components/shared/copyable-token"
import { useMarketData } from "@/hooks/use-market-data"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { cn } from "@/utils"
import nexaSocket from "@/lib/websocket/nexa-socket"
import { RollingNumber } from "@/components/ui/rolling-number"
import { RelativeAge } from "@/components/shared/relative-age"
import { BsTwitterX } from "react-icons/bs"
import { getMultipleStateIds } from "@interest-protocol/memez-fun-sdk"
import { suiClient } from "@/lib/sui-client"

interface TokenHeaderProps {
	pool: PoolWithMetadata
}

export function TokenHeader({ pool }: TokenHeaderProps) {
	const { data: marketData } = useMarketData(pool.coinType)
	const metadata = marketData?.coinMetadata || pool.coinMetadata
	const [realtimePrice, setRealtimePrice] = useState<number | null>(null)
	const [priceFlash, setPriceFlash] = useState<'up' | 'down' | null>(null)
	const [dynamicFieldId, setDynamicFieldId] = useState<string | null>(null)

	const { priceChange24h, volume24h, marketCap, totalLiquidityUsd, basePrice } = useMemo(() => {
		const price24hAgo = marketData?.price1DayAgo || 0
		const currentMarketPrice = marketData?.coinPrice || 0

		return {
			priceChange24h: price24hAgo && currentMarketPrice
				? ((currentMarketPrice - price24hAgo) / price24hAgo) * 100
				: null,
			volume24h: marketData?.coin24hTradeVolumeUsd || 0,
			basePrice: marketData?.coinPrice || 0,
			marketCap: marketData?.marketCap || 0,
			totalLiquidityUsd: marketData?.liqUsd || 0
		}
	}, [marketData])

	const currentPrice = realtimePrice || basePrice

	// update document title with symbol and market cap
	useDocumentTitle({
		symbol: metadata?.symbol,
		marketCap: marketCap,
		formatMarketCap: (value) => `$${formatNumberWithSuffix(value as number)}`
	})

	useEffect(() => {
		if (pool.poolId) {

			getMultipleStateIds([pool.poolId], suiClient)
				.then(stateIds => {
					console.log(stateIds)
					if (stateIds && stateIds[0]) {
						setDynamicFieldId(stateIds[0])
					}
				})
				.catch(error => {
					console.error('Failed to get dynamic field ID:', error)
				})
		}
	}, [pool.poolId])

	// subscribe to price updates
	useEffect(() => {
		if (!dynamicFieldId) return

		const unsubscribe = nexaSocket.subscribeToTokenPrice(
			dynamicFieldId,
			'direct',
			(price) => {
				setRealtimePrice(prevPrice => {
					if (prevPrice !== null && prevPrice !== price) {
						setPriceFlash(price > prevPrice ? 'up' : 'down')
						setTimeout(() => setPriceFlash(null), 500)
					}
					return price
				})
			}
		)

		return () => {
			unsubscribe()
		}
	}, [dynamicFieldId])

	return (
		<div className="w-full border-b border-border select-none">
			<div className="flex items-center justify-between px-2 py-1 gap-4">
				<div className="flex items-center gap-3">
					<Avatar className="w-12 h-12 rounded-lg border-2">
						<AvatarImage src={metadata?.iconUrl || ""} alt={metadata?.symbol} />
						<AvatarFallback className="font-mono rounded-none text-sm uppercase">
							{metadata?.symbol?.slice(0, 2) || "??"}
						</AvatarFallback>
					</Avatar>

					{/* Token Info and Social Links */}
					<div className="flex flex-col">
						{/* Top Row */}
						<div className="flex items-center gap-2">
							<h1 className="text-lg font-bold font-mono uppercase">
								{metadata?.name || "[UNNAMED]"}
							</h1>
							<CopyableToken
								symbol={metadata?.symbol || "[???]"}
								coinType={pool.coinType}
								className="text-sm font-mono text-muted-foreground"
							/>
						</div>

						{/* Bottom Row */}
						<div className="flex items-center gap-2">
							<RelativeAge
								timestamp={pool.createdAt ? parseInt(pool.createdAt) : Date.now()}
								className="text-xs text-muted-foreground font-mono"
							/>

							<span className="text-muted-foreground/30">|</span>

							{/* Social Links */}
							<div className="flex items-center gap-0.5">
								<Button
									variant="ghost"
									size="icon"
									className="h-5 w-5"
									asChild
								>
									<a
										href={`https://x.com/search?q=${encodeURIComponent(pool.coinType)}`}
										target="_blank"
										rel="noopener noreferrer"
										title="Search on X"
									>
										<Search className="h-3 w-3" />
									</a>
								</Button>

								{pool.metadata?.X && (
									<Button
										variant="ghost"
										size="icon"
										className="h-5 w-5"
										asChild
									>
										<a href={pool.metadata.X} target="_blank" rel="noopener noreferrer">
											<BsTwitterX className="h-3 w-3" />
										</a>
									</Button>
								)}

								{pool.metadata?.Telegram && (
									<Button
										variant="ghost"
										size="icon"
										className="h-5 w-5"
										asChild
									>
										<a href={pool.metadata.Telegram} target="_blank" rel="noopener noreferrer">
											<Send className="h-3 w-3" />
										</a>
									</Button>
								)}

								{pool.metadata?.Website && (
									<Button
										variant="ghost"
										size="icon"
										className="h-5 w-5"
										asChild
									>
										<a href={pool.metadata.Website} target="_blank" rel="noopener noreferrer">
											<Globe className="h-3 w-3" />
										</a>
									</Button>
								)}
							</div>
						</div>
					</div>

					<div className="flex items-center gap-6 ml-auto">
						{/* Price */}
						<div className="flex items-start gap-2">
							<RollingNumber
								value={currentPrice}
								formatFn={(v) => {
									if (v >= 1) return v.toFixed(2)
									if (v >= 0.01) return v.toFixed(4)
									return v.toFixed(8)
								}}
								staggerDelay={40}
								prefix="$"
								className={cn(
									"flex items-center font-mono text-2xl font-bold transition-colors",
									priceFlash === 'up' && "dark:text-green-400 text-green-500",
									priceFlash === 'down' && "text-destructive"
								)}
							/>

							{priceChange24h !== null && priceChange24h !== 0 && (
								<span className={cn(
									"text-xs font-mono font-semibold",
									priceChange24h > 0 ? "dark:text-green-400 text-green-500" : "text-destructive"
								)}>
									{priceChange24h > 0 ? "+" : ""}{priceChange24h.toFixed(2)}%
								</span>
							)}
						</div>

						{/* Market Stats */}
						<div className="flex items-center gap-4">
							<div>
								<p className="font-mono text-[10px] uppercase text-muted-foreground mb-0.5">Market Cap</p>
								<p className="font-mono text-sm font-bold text-yellow-500">
									${formatNumberWithSuffix(marketCap)}
								</p>
							</div>
							<div>
								<p className="font-mono text-[10px] uppercase text-muted-foreground mb-0.5">24h Volume</p>
								<p className="font-mono text-sm font-bold text-purple-500">
									${formatNumberWithSuffix(volume24h)}
								</p>
							</div>
							<div>
								<p className="font-mono text-[10px] uppercase text-muted-foreground mb-0.5">Liquidity</p>
								<p className="font-mono text-sm font-bold text-blue-500">
									${formatNumberWithSuffix(totalLiquidityUsd)}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}