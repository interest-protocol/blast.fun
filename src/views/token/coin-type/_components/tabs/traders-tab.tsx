"use client"

import { useState, useMemo } from "react"
import { Token } from "@/types/token"
import { BarChart3, User, ExternalLink } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useQuery } from "@tanstack/react-query"
import { formatAddress } from "@mysten/sui/utils"
import { Logo } from "@/components/ui/logo"
import { cn } from "@/utils"
import { formatNumberWithSuffix } from "@/utils/format"
import { useSuiNSNames } from "@/hooks/use-suins"
import { useTwitterRelations } from "../../_context/twitter-relations.context"
import type { NoodlesCoinTrader } from "@/lib/noodles/client"

interface TradersTabProps {
	pool: Token
	className?: string
}

type Period = "1d" | "3d" | "7d" | "30d"
type SortField = "pnl" | "vol_buy" | "vol_sell" | "tx_buy" | "tx_sell"

const PERIODS: { value: Period; label: string }[] = [
	{ value: "1d", label: "1D" },
	{ value: "3d", label: "3D" },
	{ value: "7d", label: "7D" },
	{ value: "30d", label: "30D" },
]

const SORT_OPTIONS: { value: SortField; label: string }[] = [
	{ value: "pnl", label: "PNL" },
	{ value: "vol_buy", label: "Buy Vol" },
	{ value: "vol_sell", label: "Sell Vol" },
	{ value: "tx_buy", label: "Buys" },
	{ value: "tx_sell", label: "Sells" },
]

export function TradersTab({ pool, className }: TradersTabProps) {
	const [period, setPeriod] = useState<Period>("7d")
	const [sortField, setSortField] = useState<SortField>("pnl")

	const { addressToTwitter } = useTwitterRelations()

	const { data, isLoading, error } = useQuery({
		queryKey: ["coin-traders", pool.coinType, period, sortField],
		queryFn: async () => {
			const params = new URLSearchParams({
				period,
				sortField,
				sortDirection: "desc",
				limit: "50",
			})
			const res = await fetch(
				`/api/coin/${encodeURIComponent(pool.coinType)}/traders?${params}`
			)
			if (!res.ok) return []
			const json = await res.json()
			return (json.traders ?? []) as NoodlesCoinTrader[]
		},
		enabled: !!pool.coinType,
		staleTime: 30_000,
	})

	const traders = data ?? []

	const traderAddresses = useMemo(() => {
		return traders
			.map((t) => t.address)
			.filter((addr) => !addressToTwitter.has(addr))
	}, [traders, addressToTwitter])

	const { data: suinsNames } = useSuiNSNames(traderAddresses)

	if (isLoading) {
		return (
			<div className="p-4 space-y-1">
				{Array.from({ length: 10 }).map((_, i) => (
					<div key={i} className="h-12 bg-background/30 animate-pulse" />
				))}
			</div>
		)
	}

	if (error) {
		return (
			<div className="p-8 text-center">
				<Logo className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
				<p className="font-mono text-sm uppercase text-destructive">ERROR::LOADING::TRADERS</p>
			</div>
		)
	}

	return (
		<div className={cn("flex flex-col h-full overflow-hidden", className)}>
			<div className="flex items-center justify-between gap-2 px-2 sm:px-4 py-2 border-b border-border/50 shrink-0">
				<div className="flex items-center gap-1">
					{PERIODS.map((p) => (
						<button
							key={p.value}
							onClick={() => setPeriod(p.value)}
							className={cn(
								"px-2 py-1 rounded font-mono text-[10px] sm:text-xs uppercase tracking-wider transition-all",
								period === p.value
									? "bg-primary/10 text-primary border border-primary/20"
									: "text-muted-foreground hover:text-foreground hover:bg-accent/50"
							)}
						>
							{p.label}
						</button>
					))}
				</div>
				<div className="flex items-center gap-1">
					{SORT_OPTIONS.map((s) => (
						<button
							key={s.value}
							onClick={() => setSortField(s.value)}
							className={cn(
								"px-2 py-1 rounded font-mono text-[10px] sm:text-xs uppercase tracking-wider transition-all hidden sm:block",
								sortField === s.value
									? "bg-primary/10 text-primary border border-primary/20"
									: "text-muted-foreground hover:text-foreground hover:bg-accent/50"
							)}
						>
							{s.label}
						</button>
					))}
					<select
						value={sortField}
						onChange={(e) => setSortField(e.target.value as SortField)}
						className="sm:hidden bg-transparent border border-border/50 rounded px-1 py-1 font-mono text-[10px] uppercase text-muted-foreground"
					>
						{SORT_OPTIONS.map((s) => (
							<option key={s.value} value={s.value}>{s.label}</option>
						))}
					</select>
				</div>
			</div>

			<ScrollArea className="flex-1 min-h-0">
				{traders.length === 0 ? (
					<div className="text-center py-12">
						<BarChart3 className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
						<p className="font-mono text-sm uppercase text-muted-foreground">NO::TRADERS::FOUND</p>
					</div>
				) : (
					<div className="relative">
						<div className="grid grid-cols-12 gap-1 sm:gap-2 px-2 sm:px-4 py-2 border-b border-border/50 text-[10px] sm:text-xs font-mono uppercase text-muted-foreground sticky top-0 bg-background/95 backdrop-blur-sm z-10 select-none">
							<div className="col-span-1">#</div>
							<div className="col-span-3 sm:col-span-3">Trader</div>
							<div className="col-span-2 text-right">Buys</div>
							<div className="col-span-2 text-right">Sells</div>
							<div className="col-span-4 sm:col-span-4 text-right">PNL</div>
						</div>

						{traders.map((trader, index) => {
							const isCreator = trader.address === pool.creator?.address
							const isProfitable = trader.pnl >= 0
							const totalVol = trader.volBuy + trader.volSell

							return (
								<div
									key={trader.address}
									className="group hover:bg-muted/5 transition-all duration-200"
								>
									<div className="grid grid-cols-12 gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 items-center border-b border-border/30">
										<div className="col-span-1 font-mono text-[10px] sm:text-xs text-muted-foreground">
											{index + 1}
										</div>

										<div className="col-span-3 sm:col-span-3 flex items-center gap-1 overflow-hidden">
											{addressToTwitter.has(trader.address) ? (
												<a
													href={`https://x.com/${addressToTwitter.get(trader.address)}`}
													target="_blank"
													rel="noopener noreferrer"
													className="font-mono text-[10px] sm:text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 min-w-0"
												>
													<User className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
													<span className="text-primary truncate max-w-[80px] sm:max-w-[120px]">
														@{addressToTwitter.get(trader.address)}
													</span>
												</a>
											) : suinsNames?.[trader.address] ? (
												<a
													href={`https://suivision.xyz/account/${trader.address}`}
													target="_blank"
													rel="noopener noreferrer"
													className="font-mono text-[10px] sm:text-xs text-primary hover:underline transition-colors truncate max-w-[80px] sm:max-w-[120px]"
												>
													{suinsNames[trader.address]}
												</a>
											) : (
												<a
													href={`https://suivision.xyz/account/${trader.address}`}
													target="_blank"
													rel="noopener noreferrer"
													className="font-mono text-[10px] sm:text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
												>
													<span className="sm:hidden">{formatAddress(trader.address).slice(0, 4)}...</span>
													<span className="hidden sm:inline">{formatAddress(trader.address)}</span>
												</a>
											)}
											{isCreator && (
												<span className="text-destructive font-mono text-[10px] font-bold flex-shrink-0">(DEV)</span>
											)}
											<a
												href={`https://suivision.xyz/account/${trader.address}`}
												target="_blank"
												rel="noopener noreferrer"
												className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-primary flex-shrink-0"
											>
												<ExternalLink className="h-2.5 w-2.5" />
											</a>
										</div>

										<div className="col-span-2 text-right">
											<div className="font-mono text-[10px] sm:text-xs text-green-500">
												{trader.txBuy}
											</div>
											<div className="font-mono text-[9px] sm:text-[10px] text-muted-foreground/60">
												${formatNumberWithSuffix(trader.volBuy)}
											</div>
										</div>

										<div className="col-span-2 text-right">
											<div className="font-mono text-[10px] sm:text-xs text-red-500">
												{trader.txSell}
											</div>
											<div className="font-mono text-[9px] sm:text-[10px] text-muted-foreground/60">
												${formatNumberWithSuffix(trader.volSell)}
											</div>
										</div>

										<div className="col-span-4 sm:col-span-4 text-right">
											<div className={cn(
												"font-mono text-[10px] sm:text-xs font-semibold",
												isProfitable ? "text-green-500" : "text-destructive"
											)}>
												{isProfitable ? "+" : ""}${formatNumberWithSuffix(Math.abs(trader.pnl))}
											</div>
											<div className="font-mono text-[9px] sm:text-[10px] text-muted-foreground/60">
												vol ${formatNumberWithSuffix(totalVol)}
											</div>
										</div>
									</div>
								</div>
							)
						})}
					</div>
				)}
			</ScrollArea>
		</div>
	)
}
