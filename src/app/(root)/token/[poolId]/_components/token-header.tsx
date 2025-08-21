"use client"

import { Globe, Send, Search, Flame } from "lucide-react"
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { PoolWithMetadata } from "@/types/pool"
import { formatNumberWithSuffix } from "@/utils/format"
import { CopyableToken } from "@/components/shared/copyable-token"
import { cn } from "@/utils"
import { RollingNumber } from "@/components/ui/rolling-number"
import { RelativeAge } from "@/components/shared/relative-age"
import { BsTwitterX } from "react-icons/bs"
import { BurnDialog } from "./burn-dialog"
import { useApp } from "@/context/app.context"

interface TokenHeaderProps {
	pool: PoolWithMetadata
	realtimePrice: number | null
	realtimeMarketCap?: number | null
}

export function TokenHeader({ pool, realtimePrice, realtimeMarketCap }: TokenHeaderProps) {
	const { isConnected } = useApp()
	const metadata = pool.coinMetadata || pool.metadata
	const marketData = pool.marketData
	const [priceFlash, setPriceFlash] = useState<'up' | 'down' | null>(null)
	const [previousPrice, setPreviousPrice] = useState<number | null>(null)
	const [marketCapFlash, setMarketCapFlash] = useState<'up' | 'down' | null>(null)
	const [previousMarketCap, setPreviousMarketCap] = useState<number | null>(null)
	const [burnDialogOpen, setBurnDialogOpen] = useState(false)

	// calculate price metrics from server data
	const priceChange24h = marketData?.price1DayAgo && marketData?.coinPrice
		? ((marketData.coinPrice - marketData.price1DayAgo) / marketData.price1DayAgo) * 100
		: null

	const volume24h = marketData?.coin24hTradeVolumeUsd || 0
	const basePrice = marketData?.coinPrice || 0
	const baseMarketCap = marketData?.marketCap || 0
	const totalLiquidityUsd = marketData?.totalLiquidityUsd || marketData?.liqUsd || 0

	const currentPrice = realtimePrice || basePrice
	const currentMarketCap = realtimeMarketCap || baseMarketCap

	// Handle price flash when price changes
	useEffect(() => {
		if (realtimePrice !== null && previousPrice !== null && realtimePrice !== previousPrice) {
			setPriceFlash(realtimePrice > previousPrice ? 'up' : 'down')
			setTimeout(() => setPriceFlash(null), 500)
		}
		setPreviousPrice(realtimePrice)
	}, [realtimePrice, previousPrice])

	// Handle market cap flash when it changes
	useEffect(() => {
		if (realtimeMarketCap !== null && realtimeMarketCap !== undefined && previousMarketCap !== null && realtimeMarketCap !== previousMarketCap) {
			setMarketCapFlash(realtimeMarketCap > previousMarketCap ? 'up' : 'down')
			setTimeout(() => setMarketCapFlash(null), 500)
		}
		if (realtimeMarketCap !== undefined) {
			setPreviousMarketCap(realtimeMarketCap)
		}
	}, [realtimeMarketCap, previousMarketCap])

	return (
		<div className="w-full border-b border-border select-none">
			<div className="flex items-center justify-between px-2 py-1 gap-4">
				<div className="flex items-center gap-3">
					<Avatar className="w-12 h-12 rounded-lg border-2">
						<AvatarImage src={metadata?.iconUrl || metadata?.icon_url || ""} alt={metadata?.symbol} />
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
								<RollingNumber
									value={currentMarketCap}
									formatFn={(v) => `$${formatNumberWithSuffix(v)}`}
									staggerDelay={40}
									className={cn(
										"font-mono text-sm font-bold text-yellow-500 transition-colors",
										marketCapFlash === 'up' && "dark:text-green-400 text-green-500",
										marketCapFlash === 'down' && "text-destructive"
									)}
								/>
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
							
							{/* Burn Button */}
							{isConnected && (
								<Button
									variant="outline"
									size="sm"
									onClick={() => setBurnDialogOpen(true)}
									className="ml-2 border-orange-500/50 hover:bg-orange-500/10 hover:border-orange-500"
								>
									<Flame className="h-4 w-4 text-orange-500 mr-1" />
									<span className="text-xs font-mono uppercase">Burn</span>
								</Button>
							)}
						</div>
					</div>
				</div>
			</div>
			
			{/* Burn Dialog */}
			<BurnDialog
				open={burnDialogOpen}
				onOpenChange={setBurnDialogOpen}
				pool={pool}
			/>
		</div>
	)
}