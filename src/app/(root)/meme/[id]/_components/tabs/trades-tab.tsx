"use client"

import { useState, useRef, useMemo, useCallback, useEffect } from "react"
import { PoolWithMetadata } from "@/types/pool"
import { Activity, ExternalLink } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useMarketData } from "@/hooks/use-market-data"
import { formatAddress } from "@mysten/sui/utils"
import { getTxExplorerUrl } from "@/utils/transaction"
import { Logo } from "@/components/ui/logo"
import nexaSocket from "@/lib/websocket/nexa-socket"
import { nexaClient } from "@/lib/nexa"
import { cn } from "@/utils"
import { formatAmountWithSuffix, formatNumberWithSuffix } from "@/utils/format"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DEFAULT_TOKEN_DECIMALS } from "@/constants"
import type { TradeData, CoinTrade, UnifiedTrade } from "@/types/trade"
import { playSound } from "@/lib/audio"
import { RelativeAge } from "@/components/shared/relative-age"

interface TradesTabProps {
	pool: PoolWithMetadata
	className?: string
	onLoad?: () => void
	isVisible?: boolean
}

function useRealtimeTrades(coinType: string, poolSymbol?: string, isVisible: boolean = true) {
	const [realtimeTrades, setRealtimeTrades] = useState<UnifiedTrade[]>([])
	const [isSubscribed, setIsSubscribed] = useState(false)

	const handleNewTrade = useCallback((trade: TradeData) => {
		const isBuy = trade.coinOut === coinType
		const coinInDecimals = trade.coinInMetadata?.decimals || DEFAULT_TOKEN_DECIMALS
		const coinOutDecimals = trade.coinOutMetadata?.decimals || DEFAULT_TOKEN_DECIMALS
		const amountIn = Number(trade.amountIn) / Math.pow(10, coinInDecimals)
		const amountOut = Number(trade.amountOut) / Math.pow(10, coinOutDecimals)

		const newTrade: UnifiedTrade = {
			id: trade._id || trade.digest,
			timestamp: trade.timestampMs,
			type: isBuy ? "BUY" : "SELL",
			amountIn,
			amountOut,
			coinIn: trade.coinIn,
			coinOut: trade.coinOut,
			coinInSymbol: trade.coinInMetadata?.symbol || (isBuy ? "SUI" : poolSymbol),
			coinOutSymbol: trade.coinOutMetadata?.symbol || (isBuy ? poolSymbol : "SUI"),
			coinInIconUrl: trade.coinInMetadata?.iconUrl || trade.coinInMetadata?.icon_url,
			coinOutIconUrl: trade.coinOutMetadata?.iconUrl || trade.coinOutMetadata?.icon_url,
			price: isBuy ? trade.priceOut : trade.priceIn,
			value: isBuy ? amountOut * trade.priceOut : amountIn * trade.priceIn,
			trader: trade.user,
			digest: trade.digest,
			isRealtime: true
		}

		setRealtimeTrades(prev => [newTrade, ...prev].slice(0, 100))
		playSound('new_trade')
		setIsSubscribed(true)
	}, [coinType, poolSymbol])

	useEffect(() => {
		if (!coinType || !isVisible) return

		const unsubscribe = nexaSocket.subscribeToCoinTrades(coinType, handleNewTrade)
		const timer = setTimeout(() => {
			setIsSubscribed(true)
		}, 1000)

		return () => {
			clearTimeout(timer)
			unsubscribe()
			setIsSubscribed(false)
		}
	}, [coinType, isVisible, handleNewTrade])

	return { realtimeTrades, isSubscribed }
}

export function TradesTab({ pool, className, onLoad, isVisible = true }: TradesTabProps) {
	const TRADES_PER_PAGE = 20
	const { data: marketData } = useMarketData(pool.coinType)
	const metadata = marketData?.coinMetadata || pool.coinMetadata

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		error
	} = useInfiniteQuery({
		queryKey: ["trades", pool.coinType],
		queryFn: async ({ pageParam = 0 }) => {
			const data = await nexaClient.getTrades(pool.coinType, TRADES_PER_PAGE, pageParam)
			return data as CoinTrade[]
		},
		getNextPageParam: (lastPage, allPages) => {
			if (lastPage.length < TRADES_PER_PAGE) return undefined
			return allPages.length * TRADES_PER_PAGE
		},
		enabled: !!pool.coinType,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		staleTime: Infinity,
		initialPageParam: 0
	})

	const { realtimeTrades } = useRealtimeTrades(pool.coinType, metadata?.symbol, isVisible)

	const historicalTrades = useMemo(() => {
		if (!data?.pages) return []

		return data.pages.flatMap(page =>
			page.map((trade: CoinTrade) => {
				const isBuy = trade.coinOut === pool.coinType
				const coinInDecimals = Number(trade.coinInMetadata?.decimals) || DEFAULT_TOKEN_DECIMALS
				const coinOutDecimals = Number(trade.coinOutMetadata?.decimals) || DEFAULT_TOKEN_DECIMALS
				const amountIn = Number(trade.amountIn) / Math.pow(10, coinInDecimals)
				const amountOut = Number(trade.amountOut) / Math.pow(10, coinOutDecimals)

				return {
					id: trade._id || trade.digest,
					timestamp: trade.timestampMs,
					type: isBuy ? "BUY" : "SELL",
					amountIn,
					amountOut,
					coinIn: trade.coinIn,
					coinOut: trade.coinOut,
					coinInSymbol: trade.coinInMetadata?.symbol || (isBuy ? "SUI" : metadata?.symbol),
					coinOutSymbol: trade.coinOutMetadata?.symbol || (isBuy ? metadata?.symbol : "SUI"),
					coinInIconUrl: trade.coinInMetadata?.iconUrl || trade.coinInMetadata?.icon_url,
					coinOutIconUrl: trade.coinOutMetadata?.iconUrl || trade.coinOutMetadata?.icon_url,
					price: isBuy ? trade.priceOut : trade.priceIn,
					value: isBuy ? amountOut * trade.priceOut : amountIn * trade.priceIn,
					trader: trade.user,
					digest: trade.digest,
					isRealtime: false
				} as UnifiedTrade
			})
		)
	}, [data?.pages, metadata?.symbol, pool.coinType])

	const unifiedTrades = useMemo(() => {
		const combined = [...realtimeTrades, ...historicalTrades]

		// deduplicate by digest
		const uniqueTrades = Array.from(new Map(combined.filter(t => t.digest).map(t => [t.digest, t])).values())
		return uniqueTrades.sort((a, b) => b.timestamp - a.timestamp)
	}, [realtimeTrades, historicalTrades])

	const maxVolume = useMemo(() => {
		return Math.max(...unifiedTrades.slice(0, 50).map(t => t.value), 1)
	}, [unifiedTrades])

	const scrollRef = useRef<HTMLDivElement>(null)
	const loadMoreRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage()
				}
			},
			{ threshold: 0.1 }
		)

		if (loadMoreRef.current) {
			observer.observe(loadMoreRef.current)
		}

		return () => observer.disconnect()
	}, [hasNextPage, isFetchingNextPage, fetchNextPage])

	useEffect(() => {
		if (!isLoading && onLoad) {
			onLoad()
		}
	}, [isLoading, onLoad])

	const formatValue = (value: number) => {
		if (value < 1) return `$${value.toFixed(4)}`
		if (value < 1000) return `$${value.toFixed(2)}`
		return `$${formatAmountWithSuffix(value)}`
	}

	if (isLoading) {
		return (
			<div className="p-4 space-y-1">
				{Array.from({ length: 15 }).map((_, i) => (
					<div
						key={i}
						className="h-12 bg-background/30 animate-pulse"
					/>
				))}
			</div>
		)
	}

	if (error) {
		return (
			<div className="p-8 text-center">
				<Logo className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
				<p className="font-mono text-sm uppercase text-destructive">ERROR::LOADING::TRADES</p>
				<p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">CHECK_CONNECTION</p>
			</div>
		)
	}

	return (
		<ScrollArea className={cn(className || "h-[500px]")} ref={scrollRef}>
			<div className="w-full">
				{unifiedTrades.length === 0 ? (
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
					<div className="relative">
						<div className="grid grid-cols-12 gap-2 px-2 sm:px-4 py-2 border-b border-border/50 text-[10px] sm:text-xs font-mono uppercase text-muted-foreground sticky top-0 bg-background/95 backdrop-blur-sm z-10 select-none">
							<div className="col-span-2 flex items-center gap-1">Age</div>
							<div className="col-span-1">Type</div>
							<div className="col-span-4 sm:col-span-3">Trade</div>
							<div className="col-span-2 text-right hidden sm:block">Price</div>
							<div className="col-span-3 sm:col-span-2 text-right">Value</div>
							<div className="col-span-2 text-right">Trader</div>
						</div>

						{unifiedTrades.map((trade) => {
							const isBuy = trade.type === "BUY"
							const isNewTrade = trade.isRealtime &&
								(Date.now() - trade.timestamp) < 5000
							const volumePercentage = Math.min((trade.value / maxVolume) * 100, 100)

							return (
								<div
									key={trade.digest}
									className={cn(
										"relative group hover:bg-muted/5 transition-all duration-200",
										isNewTrade && "animate-in fade-in slide-in-from-top-1"
									)}
								>
									<div
										className={cn(
											"absolute inset-0 opacity-10 transition-all duration-500",
											isBuy ? "bg-green-500" : "bg-red-500"
										)}
										style={{ width: `${volumePercentage}%` }}
									/>

									<div className="relative grid grid-cols-12 gap-2 px-2 sm:px-4 py-2 sm:py-3 items-center border-b border-border/30">
										<div className="col-span-2 font-mono text-[10px] sm:text-xs text-muted-foreground">
											<RelativeAge timestamp={trade.timestamp} />
										</div>

										<div className="col-span-1">
											<span className={cn(
												"font-mono text-[10px] sm:text-xs font-bold uppercase",
												isBuy ? "text-green-500" : "text-red-500"
											)}>
												<span className="hidden sm:inline">{trade.type}</span>
												<span className="sm:hidden">{trade.type.slice(0, 1)}</span>
											</span>
										</div>

										<div className="col-span-4 sm:col-span-3 flex items-center gap-1 font-mono text-[10px] sm:text-xs">
											<span className="text-foreground">
												{formatNumberWithSuffix(trade.amountIn)}
											</span>
											{trade.coinInIconUrl && (
												<Avatar className="w-3 h-3 sm:w-4 sm:h-4">
													<AvatarImage src={trade.coinInIconUrl} alt={trade.coinInSymbol} />
													<AvatarFallback className="text-[6px] sm:text-[8px]">
														{trade.coinInSymbol?.slice(0, 2)}
													</AvatarFallback>
												</Avatar>
											)}
											<span className="text-muted-foreground hidden sm:inline">
												{trade.coinInSymbol || '???'}
											</span>
											<span className="text-muted-foreground mx-0.5 sm:mx-1">→</span>
											<span className="text-foreground">
												{formatNumberWithSuffix(trade.amountOut)}
											</span>
											{trade.coinOutIconUrl && (
												<Avatar className="w-3 h-3 sm:w-4 sm:h-4">
													<AvatarImage src={trade.coinOutIconUrl} alt={trade.coinOutSymbol} />
													<AvatarFallback className="text-[6px] sm:text-[8px]">
														{trade.coinOutSymbol?.slice(0, 2)}
													</AvatarFallback>
												</Avatar>
											)}
											<span className="text-muted-foreground hidden sm:inline">
												{trade.coinOutSymbol || '???'}
											</span>
										</div>

										<div className="col-span-2 text-right font-mono text-[10px] sm:text-xs text-foreground/80 hidden sm:block">
											${trade.price > 0.01 ? trade.price.toFixed(4) : trade.price.toFixed(8)}
										</div>

										<div className="col-span-3 sm:col-span-2 text-right font-mono text-[10px] sm:text-xs text-foreground/60">
											{formatValue(trade.value)}
										</div>

										<div className="col-span-2 text-right flex items-center justify-end gap-0.5 sm:gap-1">
											<a
												href={`https://suivision.xyz/account/${trade.trader}`}
												target="_blank"
												rel="noopener noreferrer"
												className="font-mono text-[10px] sm:text-xs text-muted-foreground hover:text-primary transition-colors"
											>
												<span className="sm:hidden">{formatAddress(trade.trader).slice(0, 4) + '...'}</span>
												<span className="hidden sm:inline">{formatAddress(trade.trader)}</span>
											</a>
											<a
												href={getTxExplorerUrl(trade.digest)}
												target="_blank"
												rel="noopener noreferrer"
												className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-primary"
											>
												<ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
											</a>
										</div>
									</div>
								</div>
							)
						})}

						{hasNextPage && (
							<div ref={loadMoreRef} className="py-4 text-center">
								{isFetchingNextPage ? (
									<div className="font-mono text-xs text-muted-foreground">
										LOADING::MORE::TRADES...
									</div>
								) : (
									<div className="font-mono text-xs text-muted-foreground">
										SCROLL::FOR::MORE
									</div>
								)}
							</div>
						)}
					</div>
				)}
			</div>
		</ScrollArea>
	)
}