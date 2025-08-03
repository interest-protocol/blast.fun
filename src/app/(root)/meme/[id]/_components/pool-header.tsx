"use client"

import { Globe, Send, Twitter, TrendingUp, TrendingDown } from "lucide-react"
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { PoolWithMetadata } from "@/types/pool"
import { formatNumberWithSuffix } from "@/utils/format"
import { CopyableToken } from "@/components/shared/copyable-token"
import { CreatorHoverCard } from "@/components/creator/creator-hover-card"
import { CreatorDisplay } from "@/components/creator/creator-display"
import { useMarketData } from "@/hooks/use-market-data"
import { cn } from "@/utils"
import nexaSocket from "@/lib/websocket/nexa-socket"
import { RollingNumber } from "@/components/ui/rolling-number"

interface PoolHeaderProps {
	pool: PoolWithMetadata
}

export function PoolHeader({ pool }: PoolHeaderProps) {
	const metadata = pool.coinMetadata
	const { data: marketData } = useMarketData(pool.coinType)
	const [realtimePrice, setRealtimePrice] = useState<number | null>(null)
	const [priceFlash, setPriceFlash] = useState<'up' | 'down' | null>(null)

	const creatorTwitterId = pool.metadata?.CreatorTwitterId
	const creatorTwitterName = pool.metadata?.CreatorTwitterName
	const creatorWallet = pool.metadata?.CreatorWallet || pool.creatorAddress
	const showTwitterCreator = creatorTwitterId && creatorTwitterName

	const priceChange24h = marketData?.percentagePriceChange24h ? parseFloat(marketData.percentagePriceChange24h) : null
	const volume24h = marketData ? parseFloat(marketData.volume24h) : 0
	const basePrice = marketData ? parseFloat(marketData.coinPrice) : 0
	const currentPrice = realtimePrice || basePrice
	const marketCap = marketData ? parseFloat(marketData.marketCap) : 0
	const totalLiquidityUsd = marketData ? parseFloat(marketData.totalLiquidityUsd) : 0

	// subscribe to realtime price updates
	useEffect(() => {
		if (!pool.poolId) return

		const unsubscribe = nexaSocket.subscribeToTokenPrice(
			pool.pumpPoolData!.dynamicFieldDataId,
			'direct',
			(price) => {
				setRealtimePrice(prevPrice => {
					// flash indicator for price changes
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
	}, [pool.poolId])

	return (
		<div className="border-2 shadow-lg rounded-xl p-3 sm:p-2 overflow-hidden">
			<div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 select-none">
				<div className="flex items-center gap-3 w-full sm:w-auto">
					<div className="relative group">
						<div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
						<Avatar className="relative w-12 h-12 rounded-lg border-2 border-primary/30 flex-shrink-0 transition-transform group-hover:scale-105">
							<AvatarImage src={metadata?.iconUrl || ""} alt={metadata?.symbol} />
							<AvatarFallback className="font-mono text-xs uppercase bg-gradient-to-br from-primary/10 to-purple-500/10">
								{metadata?.symbol?.slice(0, 2) || "??"}
							</AvatarFallback>
						</Avatar>
					</div>

					<div className="flex-1 min-w-0">
						<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
							<h1 className="text-base sm:text-lg font-bold font-mono uppercase tracking-wider truncate hover:text-primary transition-colors">
								{metadata?.name || "[UNNAMED]"}
							</h1>

							<div className="flex items-center gap-2">
								<CopyableToken
									symbol={metadata?.symbol || "[???]"}
									coinType={pool.coinType}
									className="text-xs font-bold text-primary/70 hover:text-primary"
								/>
								{pool.migrated && (
									<Badge className="font-mono text-xs uppercase h-5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-500 border-green-500/30 hover:border-green-500/50 transition-all">
										MIGRATED
									</Badge>
								)}
							</div>
						</div>

						<div className="flex items-center gap-1 text-xs font-mono">
							<span className="text-muted-foreground/70">by</span>
							<CreatorHoverCard
								twitterHandle={showTwitterCreator ? creatorTwitterName : undefined}
								walletAddress={creatorWallet}
							>
								<span>
									<CreatorDisplay
										twitterHandle={showTwitterCreator ? creatorTwitterName : undefined}
										walletAddress={creatorWallet}
										className="font-bold text-primary/80 hover:text-primary transition-all hover:scale-105"
									/>
								</span>
							</CreatorHoverCard>
						</div>
					</div>
				</div>

				<div className="flex flex-col sm:flex-row sm:flex-1 sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto">
					<div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4 sm:flex sm:items-center">
						{/* Price */}
						<div className="group cursor-default">
							<p className="font-mono font-semibold text-[10px] sm:text-xs uppercase text-muted-foreground/70 mb-0.5">Price</p>
							<div className="flex items-center gap-1">
								<div className={cn(
									"font-mono text-xs sm:text-sm font-bold text-primary group-hover:text-primary/80 transition-all duration-200",
									priceFlash === 'up' && "text-green-500",
									priceFlash === 'down' && "text-red-500"
								)}>
									$<RollingNumber
										value={currentPrice}
										formatFn={(v) => v > 0.01 ? v.toFixed(4) : v.toFixed(8)}
										staggerDelay={40}
									/>
								</div>

								{priceChange24h && priceChange24h !== 0 && (
									<span className={cn(
										"flex items-center gap-0.5 text-[10px] sm:text-xs font-mono font-bold px-1 py-0.5 rounded",
										priceChange24h > 0
											? "text-green-500 bg-green-500/10"
											: "text-red-500 bg-red-500/10"
									)}>
										{priceChange24h > 0 ? (
											<TrendingUp className="w-3 h-3" />
										) : (
											<TrendingDown className="w-3 h-3" />
										)}
										{priceChange24h > 0 ? "+" : ""}{priceChange24h.toFixed(1)}%
									</span>
								)}
							</div>
						</div>

						{/* Market Cap */}
						<div className="group cursor-default">
							<p className="font-mono font-semibold text-[10px] sm:text-xs uppercase text-muted-foreground/70 mb-0.5">Market Cap</p>
							<p className="font-mono text-xs sm:text-sm font-bold text-emerald-500 group-hover:text-emerald-400 transition-colors">
								${formatNumberWithSuffix(marketCap)}
							</p>
						</div>

						{/* 24h Volume */}
						<div className="group cursor-default">
							<p className="font-mono font-semibold text-[10px] sm:text-xs uppercase text-muted-foreground/70 mb-0.5">24h Vol</p>
							<p className="font-mono text-xs sm:text-sm font-bold text-purple-500 group-hover:text-purple-400 transition-colors">
								${formatNumberWithSuffix(volume24h)}
							</p>
						</div>

						{/* Liquidity */}
						<div className="hidden sm:block group cursor-default">
							<p className="font-mono font-semibold text-[10px] sm:text-xs uppercase text-muted-foreground/70 mb-0.5">Liquidity</p>
							<p className="font-mono text-xs sm:text-sm font-bold text-blue-500 group-hover:text-blue-400 transition-colors">
								${formatNumberWithSuffix(totalLiquidityUsd)}
							</p>
						</div>
					</div>

					{/* Social Links */}
					<div className="flex gap-1 justify-end">
						{pool.metadata?.X && (
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 hover:text-blue-400 hover:bg-blue-400/10 transition-all"
								asChild
							>
								<a href={pool.metadata.X} target="_blank" rel="noopener noreferrer">
									<Twitter className="h-4 w-4" />
								</a>
							</Button>
						)}
						{pool.metadata?.Telegram && (
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 hover:text-blue-500 hover:bg-blue-500/10 transition-all"
								asChild
							>
								<a href={pool.metadata.Telegram} target="_blank" rel="noopener noreferrer">
									<Send className="h-4 w-4" />
								</a>
							</Button>
						)}
						{pool.metadata?.Website && (
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 hover:text-purple-500 hover:bg-purple-500/10 transition-all"
								asChild
							>
								<a href={pool.metadata.Website} target="_blank" rel="noopener noreferrer">
									<Globe className="h-4 w-4" />
								</a>
							</Button>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}