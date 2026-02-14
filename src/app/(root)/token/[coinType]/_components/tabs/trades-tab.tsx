"use client"

import { useState, useRef, useMemo, useCallback, useEffect } from "react"
import { Token } from "@/types/token"
import { Activity, ExternalLink, User } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { formatAddress } from "@mysten/sui/utils"
import { getTxExplorerUrl } from "@/utils/transaction"
import { Logo } from "@/components/ui/logo"
import tokenPriceSocket from "@/lib/websocket/token-price"
import type { MarketTrade } from "@/lib/memez/fetch-market-trades"
import { cn } from "@/utils"
import { formatAmountWithSuffix, formatNumberWithSuffix } from "@/utils/format"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DEFAULT_TOKEN_DECIMALS } from "@/constants"
import type { TradeData, CoinTrade, UnifiedTrade } from "@/types/trade"
import { playSound } from "@/lib/audio"
import { RelativeAge } from "@/components/shared/relative-age"
import { useSuiNSNames } from "@/hooks/use-suins"
import { useTwitterRelations } from "../../_context/twitter-relations.context"

interface TradesTabProps {
	pool: Token
	className?: string
}


function useRealtimeTrades(pool: Token, poolSymbol?: string) {
	const [realtimeTrades, setRealtimeTrades] = useState<UnifiedTrade[]>([])
	const coinType = pool.coinType

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
	}, [coinType, poolSymbol])

	useEffect(() => {
		if (!coinType) return

		tokenPriceSocket.subscribeToCoinTrades(coinType, handleNewTrade)

		return () => {
			tokenPriceSocket.unsubscribeFromCoinTrades(coinType)
		}
	}, [coinType, handleNewTrade])

	return { realtimeTrades }
}

export function TradesTab({ pool, className }: TradesTabProps) {
	const TRADES_PER_PAGE = 20
	const metadata = pool.metadata

	const { addressToTwitter } = useTwitterRelations()

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		error
	} = useInfiniteQuery({
		queryKey: ["trades", pool.coinType],
		queryFn: async ({ pageParam }) => {
			try {
				const params = new URLSearchParams({ limit: String(TRADES_PER_PAGE) })
				if (pageParam != null && pageParam !== "") params.set("cursor", String(pageParam))
				const res = await fetch(
					`/api/coin/${encodeURIComponent(pool.coinType)}/trades?${params}`
				)
				const data = res.ok ? await res.json() : null
				return { trades: data?.trades ?? [], nextCursor: data?.nextCursor ?? null }
			} catch {
				return { trades: [], nextCursor: null }
			}
		},
		getNextPageParam: (lastPage) => {
			const next = (lastPage as { nextCursor?: string | number | null })?.nextCursor
			return next != null ? next : undefined
		},
		enabled: !!pool.coinType,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		staleTime: Infinity,
		initialPageParam: undefined as string | number | undefined
	})

	const { realtimeTrades } = useRealtimeTrades(pool, metadata?.symbol)

	const historicalTrades = useMemo(() => {
		if (!data?.pages) return []

		return data.pages.flatMap((page) => {
			const items = (page as { trades?: MarketTrade[] })?.trades ?? (Array.isArray(page) ? (page as MarketTrade[]) : [])
			return items.map((trade) => {
				const isBuy = trade.type === "BUY"
				const quoteAmount = parseFloat(trade.quoteAmount || "0")
				const coinAmount = parseFloat(trade.coinAmount || "0")
				const price = parseFloat(trade.price || "0")
				const volumeUsd = parseFloat(trade.volume || "0") || quoteAmount

				return {
					id: trade.digest,
					timestamp: typeof trade.time === "string"
						? new Date(trade.time).getTime()
						: (trade.time as number) ?? 0,
					type: trade.type,
					amountIn: isBuy ? quoteAmount : coinAmount,
					amountOut: isBuy ? coinAmount : quoteAmount,
					coinIn: isBuy ? "0x2::sui::SUI" : pool.coinType,
					coinOut: isBuy ? pool.coinType : "0x2::sui::SUI",
					coinInSymbol: isBuy ? "SUI" : (metadata?.symbol ?? "???"),
					coinOutSymbol: isBuy ? (metadata?.symbol ?? "???") : "SUI",
					coinInIconUrl: isBuy ? undefined : metadata?.icon_url,
					coinOutIconUrl: isBuy ? metadata?.icon_url : undefined,
					price,
					value: volumeUsd,
					trader: trade.trader,
					digest: trade.digest,
					isRealtime: false
				} as UnifiedTrade
			})
		})
	}, [data?.pages, metadata?.icon_url, metadata?.symbol, pool.coinType])

	const unifiedTrades = useMemo(() => {
		const combined = [...realtimeTrades, ...historicalTrades]

		// deduplicate by digest
		const uniqueTrades = Array.from(new Map(combined.filter(t => t.digest).map(t => [t.digest, t])).values())
		return uniqueTrades.sort((a, b) => b.timestamp - a.timestamp)
	}, [realtimeTrades, historicalTrades])

	const maxVolume = useMemo(() => {
		return Math.max(...unifiedTrades.slice(0, 50).map(t => t.value), 1)
	}, [unifiedTrades])

	// @dev: Get unique trader addresses for SuiNS resolution
	const traderAddresses = useMemo(() => {
		const addresses = new Set<string>()
		unifiedTrades.forEach(trade => {
			if (trade.trader && !addressToTwitter.has(trade.trader)) {
				addresses.add(trade.trader)
			}
		})
		return Array.from(addresses)
	}, [unifiedTrades, addressToTwitter])

	// @dev: Fetch SuiNS names for all traders
	const { data: suinsNames } = useSuiNSNames(traderAddresses)

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

	const formatPrice = (price: number) => {
		// @dev: Format price to show significant digits with subscript for zeros count
		if (!price || price === 0) {
			return '$0.00'
		}

		if (price >= 1) {
			return `$${price.toFixed(2)}`
		}

		const priceStr = price.toString()
		const match = priceStr.match(/^0\.0*(\d{1,4})/)
		
		if (match) {
			const zeros = priceStr.match(/^0\.(0*)/)?.[1] || ''
			const significantDigits = match[1]
			const subZeroCount = zeros.length
			
			if (subZeroCount > 0) {
				// @dev: Return JSX with subscript for zero count
				return (
					<span>
						$0.0<sub className="text-[8px] sm:text-[10px]">{subZeroCount}</sub>{significantDigits}
					</span>
				)
			} else {
				return `$0.${significantDigits}`
			}
		}
		
		return `$${price.toFixed(4)}`
	}

	const formatValue = (value: number) => {
		if (value === 0) return "-"
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
						<div className="grid grid-cols-12 gap-1 sm:gap-2 px-2 sm:px-4 py-2 border-b border-border/50 text-[10px] sm:text-xs font-mono uppercase text-muted-foreground sticky top-0 bg-background/95 backdrop-blur-sm z-10 select-none">
							<div className="col-span-1">Age</div>
							<div className="col-span-1">Type</div>
							<div className="col-span-5 sm:col-span-5 md:col-span-5 lg:col-span-5 xl:col-span-4">Trade</div>
							<div className="col-span-1 text-right hidden xl:block">Price</div>
							<div className="col-span-2 text-right">Value</div>
							<div className="col-span-3 sm:col-span-3 md:col-span-3 lg:col-span-3 xl:col-span-3 text-right">Trader</div>
						</div>

						{unifiedTrades.map((trade) => {
							const isBuy = trade.type === "BUY"
							const isNewTrade = trade.isRealtime &&
								(Date.now() - trade.timestamp) < 5000
							const volumePercentage = Math.min((trade.value / maxVolume) * 100, 100)
							const isCreator = trade.trader === pool.creator?.address

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

									<div className="relative grid grid-cols-12 gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 items-center border-b border-border/30">
										<div className="col-span-1 font-mono text-[10px] sm:text-xs text-muted-foreground">
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

										<div className="col-span-5 sm:col-span-5 md:col-span-5 lg:col-span-5 xl:col-span-4 flex items-center gap-0.5 sm:gap-1 font-mono text-[10px] sm:text-xs overflow-hidden">
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

										<div className="col-span-1 text-right font-mono text-[10px] sm:text-xs text-foreground/80 hidden xl:block">
											{formatPrice(trade.price)}
										</div>

										<div className="col-span-2 text-right font-mono text-[10px] sm:text-xs text-foreground/60">
											{formatValue(trade.value)}
										</div>

										<div className="col-span-3 sm:col-span-3 md:col-span-3 lg:col-span-3 xl:col-span-3 text-right flex items-center justify-end gap-0.5 sm:gap-1 overflow-hidden">
											{addressToTwitter.has(trade.trader) ? (
												<a
													href={`https://x.com/${addressToTwitter.get(trade.trader)}`}
													target="_blank"
													rel="noopener noreferrer"
													className="font-mono text-[10px] sm:text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
												>
													<User className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
													<span className="text-primary truncate max-w-[80px] sm:max-w-[120px] md:max-w-[150px]">@{addressToTwitter.get(trade.trader)}</span>
													{isCreator && (
														<span className="text-destructive font-bold flex-shrink-0">(DEV)</span>
													)}
												</a>
											) : suinsNames?.[trade.trader] ? (
												<a
													href={`https://suivision.xyz/account/${trade.trader}`}
													target="_blank"
													rel="noopener noreferrer"
													className="font-mono text-[10px] sm:text-xs text-primary hover:underline transition-colors flex items-center gap-1 min-w-0"
												>
													<span className="truncate max-w-[80px] sm:max-w-[120px] md:max-w-[150px]">{suinsNames[trade.trader]}</span>
													{isCreator && (
														<span className="text-destructive font-bold flex-shrink-0">(DEV)</span>
													)}
												</a>
											) : (
												<a
													href={`https://suivision.xyz/account/${trade.trader}`}
													target="_blank"
													rel="noopener noreferrer"
													className="font-mono text-[10px] sm:text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
												>
													<span className="sm:hidden">{formatAddress(trade.trader).slice(0, 4) + '...'}</span>
													<span className="hidden sm:inline">{formatAddress(trade.trader)}</span>
													{isCreator && (
														<span className="text-destructive font-bold flex-shrink-0">(DEV)</span>
													)}
												</a>
											)}
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