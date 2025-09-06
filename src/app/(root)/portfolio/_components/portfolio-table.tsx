"use client"

import { TrendingDown, TrendingUp } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { formatNumber, formatPrice, formatTokenAmount } from "@/lib/format"
import type { PortfolioResponse } from "@/types/portfolio"
import { cn } from "@/utils"

interface PortfolioTableProps {
	portfolio: PortfolioResponse
	hideSmallBalance: boolean
	onHideSmallBalanceChange: (value: boolean) => void
}

type SortField = "name" | "value" | "pnl" | "pnlPercentage"
type SortOrder = "asc" | "desc"

export function PortfolioTable({ portfolio, hideSmallBalance, onHideSmallBalanceChange }: PortfolioTableProps) {
	const router = useRouter()
	const [sortField, setSortField] = useState<SortField>("value")
	const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc")
		} else {
			setSortField(field)
			setSortOrder("desc")
		}
	}

	const filteredBalances = hideSmallBalance
		? portfolio.balances.filter((balance) => balance.value >= 1)
		: portfolio.balances

	const sortedBalances = [...filteredBalances].sort((a, b) => {
		let compareValue = 0

		switch (sortField) {
			case "name":
				compareValue = (a.coinMetadata?.symbol || "").localeCompare(b.coinMetadata?.symbol || "")
				break
			case "value":
				compareValue = a.value - b.value
				break
			case "pnl":
				compareValue = a.unrealizedPnl - b.unrealizedPnl
				break
			case "pnlPercentage":
				const aPnlPerc = a.value > 0 ? (a.unrealizedPnl / a.value) * 100 : 0
				const bPnlPerc = b.value > 0 ? (b.unrealizedPnl / b.value) * 100 : 0
				compareValue = aPnlPerc - bPnlPerc
				break
		}

		return sortOrder === "asc" ? compareValue : -compareValue
	})

	return (
		<div className="overflow-hidden rounded-xl border bg-card/50 backdrop-blur-sm">
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead className="border-border border-b bg-muted/30">
						<tr>
							<th
								className="cursor-pointer px-3 py-4 text-left transition-colors hover:bg-muted/50 md:px-6"
								onClick={() => handleSort("name")}
							>
								<span className="inline-flex items-center gap-1 font-mono text-muted-foreground text-xs uppercase">
									<span>Token</span>
									{sortField === "name" && <span>{sortOrder === "asc" ? "↑" : "↓"}</span>}
								</span>
							</th>
							<th
								className="cursor-pointer px-3 py-4 text-right transition-colors hover:bg-muted/50 md:px-6"
								onClick={() => handleSort("value")}
							>
								<span className="inline-flex items-center justify-end gap-1 font-mono text-muted-foreground text-xs uppercase">
									<span>Balance</span>
									{sortField === "value" && <span>{sortOrder === "asc" ? "↑" : "↓"}</span>}
								</span>
							</th>
							<th className="hidden px-6 py-4 text-right md:table-cell">
								<span className="font-mono text-muted-foreground text-xs uppercase">Avg Entry</span>
							</th>
							<th className="hidden px-6 py-4 text-right md:table-cell">
								<span className="font-mono text-muted-foreground text-xs uppercase">Current Price</span>
							</th>
							<th
								className="cursor-pointer px-3 py-4 text-right transition-colors hover:bg-muted/50 md:px-6"
								onClick={() => handleSort("pnl")}
							>
								<span className="inline-flex items-center justify-end gap-1 font-mono text-muted-foreground text-xs uppercase">
									<span>PNL</span>
									{sortField === "pnl" && <span>{sortOrder === "asc" ? "↑" : "↓"}</span>}
								</span>
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-border">
						{sortedBalances.map((item) => {
							const pnlPercentage = item.value > 0 ? (item.unrealizedPnl / item.value) * 100 : 0
							const isProfitable = item.unrealizedPnl >= 0

							return (
								<tr
									key={item.coinType}
									className="cursor-pointer transition-colors hover:bg-muted/20"
									onClick={() => {
										if (item.coinMetadata?.poolId) {
											router.push(`/token/${item.coinMetadata.poolId}`)
										}
									}}
								>
									<td className="px-3 py-4 md:px-6">
										<div className="flex items-center gap-2 md:gap-3">
											{(item.coinMetadata?.iconUrl || item.coinMetadata?.icon_url) && (
												<div className="relative h-8 w-8">
													<Image
														src={item.coinMetadata.iconUrl || item.coinMetadata.icon_url || ""}
														alt={item.coinMetadata.symbol || ""}
														fill
														className="rounded-full object-cover"
														onError={(e) => {
															e.currentTarget.style.display = "none"
														}}
														unoptimized={true}
													/>
												</div>
											)}
											<div>
												<p className="font-mono font-semibold text-foreground/80 uppercase">
													{item.coinMetadata?.symbol || "[UNKNOWN]"}
												</p>
												<p className="font-mono text-muted-foreground/60 text-xs">
													{item.coinMetadata?.name || "[UNNAMED TOKEN]"}
												</p>
											</div>
										</div>
									</td>
									<td className="px-3 py-4 text-right md:px-6">
										<div className="flex flex-col items-end">
											<p className="font-mono font-semibold text-foreground/80 text-sm md:text-base">
												{formatTokenAmount(item.balance, item.coinMetadata?.decimals || 9)}
											</p>
											<p className="font-mono text-muted-foreground/60 text-xs">
												${formatNumber(item.value)}
											</p>
										</div>
									</td>
									<td className="hidden px-6 py-4 text-right md:table-cell">
										<p className="font-mono text-sm">{formatPrice(item.averageEntryPrice)}</p>
									</td>
									<td className="hidden px-6 py-4 text-right md:table-cell">
										<p className="font-mono text-sm">{formatPrice(item.price)}</p>
									</td>
									<td className="px-3 py-4 text-right md:px-6">
										<div className="flex flex-col items-end gap-1">
											<div className="flex items-center gap-1">
												{isProfitable ? (
													<TrendingUp className="h-4 w-4 text-green-500" />
												) : (
													<TrendingDown className="h-4 w-4 text-destructive" />
												)}
												<p
													className={cn(
														"font-mono font-semibold",
														isProfitable ? "text-green-500" : "text-destructive"
													)}
												>
													${formatNumber(Math.abs(item.unrealizedPnl))}
												</p>
											</div>
											<p
												className={cn(
													"font-mono text-xs",
													isProfitable ? "text-green-500" : "text-destructive"
												)}
											>
												{isProfitable ? "+" : ""}
												{pnlPercentage.toFixed(2)}%
											</p>
										</div>
									</td>
								</tr>
							)
						})}
					</tbody>
				</table>
			</div>
			<div className="flex items-center justify-between border-border border-t-2 bg-background/30 p-4">
				<div className="flex items-center gap-2">
					<Switch id="hide-small-balance" checked={hideSmallBalance} onCheckedChange={onHideSmallBalanceChange} />
					<label
						htmlFor="hide-small-balance"
						className="cursor-pointer font-mono text-muted-foreground text-xs uppercase tracking-wider"
					>
						HIDE SMALL BALANCES [&lt; $1]
					</label>
				</div>
				<div className="font-mono text-muted-foreground/60 text-xs uppercase tracking-wider">
					SHOWING {sortedBalances.length} OF {portfolio.balances.length} TOKENS
				</div>
			</div>
		</div>
	)
}
