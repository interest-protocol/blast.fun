"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import type { PortfolioResponse } from "@/types/portfolio"
import { formatNumber, formatPrice, formatTokenAmount } from "@/lib/format"
import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/utils"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Switch } from "@/components/ui/switch"

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
		? portfolio.balances.filter(balance => balance.value >= 1)
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
		<Card className="overflow-hidden bg-card/50 backdrop-blur-sm p-0">
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead className="border-b border-border bg-muted/30">
						<tr>
							<th
								className="px-3 md:px-6 py-4 text-left cursor-pointer hover:bg-muted/50 transition-colors"
								onClick={() => handleSort("name")}
							>
								<span className="font-mono text-xs uppercase text-muted-foreground inline-flex items-center gap-1">
									<span>Token</span>
									{sortField === "name" && <span>{sortOrder === "asc" ? "↑" : "↓"}</span>}
								</span>
							</th>
							<th
								className="px-3 md:px-6 py-4 text-right cursor-pointer hover:bg-muted/50 transition-colors"
								onClick={() => handleSort("value")}
							>
								<span className="font-mono text-xs uppercase text-muted-foreground inline-flex items-center justify-end gap-1">
									<span>Balance</span>
									{sortField === "value" && <span>{sortOrder === "asc" ? "↑" : "↓"}</span>}
								</span>
							</th>
							<th className="hidden md:table-cell px-6 py-4 text-right">
								<span className="font-mono text-xs uppercase text-muted-foreground">
									Avg Entry
								</span>
							</th>
							<th className="hidden md:table-cell px-6 py-4 text-right">
								<span className="font-mono text-xs uppercase text-muted-foreground">
									Current Price
								</span>
							</th>
							<th
								className="px-3 md:px-6 py-4 text-right cursor-pointer hover:bg-muted/50 transition-colors"
								onClick={() => handleSort("pnl")}
							>
								<span className="font-mono text-xs uppercase text-muted-foreground inline-flex items-center justify-end gap-1">
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
									className="hover:bg-muted/20 transition-colors cursor-pointer"
									onClick={() => {
										if (item.coinMetadata?.poolId) {
											router.push(`/token/${item.coinMetadata.poolId}`)
										}
									}}
								>
									<td className="px-3 md:px-6 py-4">
										<div className="flex items-center gap-2 md:gap-3">
											{(item.coinMetadata?.iconUrl || item.coinMetadata?.icon_url) && (
												<div className="relative w-8 h-8">
													<Image
														src={item.coinMetadata.iconUrl || item.coinMetadata.icon_url || ""}
														alt={item.coinMetadata.symbol || ""}
														fill
														className="rounded-full object-cover"
														onError={(e) => {
															e.currentTarget.style.display = 'none'
														}}
													/>
												</div>
											)}
											<div>
												<p className="font-mono font-semibold">
													{item.coinMetadata?.symbol || "Unknown"}
												</p>
												<p className="font-mono text-xs text-muted-foreground">
													{item.coinMetadata?.name || "Unknown Token"}
												</p>
											</div>
										</div>
									</td>
									<td className="px-3 md:px-6 py-4 text-right">
										<div className="flex flex-col items-end">
											<p className="font-mono font-semibold text-sm md:text-base">
												{formatTokenAmount(item.balance, item.coinMetadata?.decimals || 9)}
											</p>
											<p className="font-mono text-xs text-muted-foreground">
												${formatNumber(item.value)}
											</p>
										</div>
									</td>
									<td className="hidden md:table-cell px-6 py-4 text-right">
										<p className="font-mono text-sm">
											{formatPrice(item.averageEntryPrice)}
										</p>
									</td>
									<td className="hidden md:table-cell px-6 py-4 text-right">
										<p className="font-mono text-sm">
											{formatPrice(item.price)}
										</p>
									</td>
									<td className="px-3 md:px-6 py-4 text-right">
										<div className="flex flex-col items-end gap-1">
											<div className="flex items-center gap-1">
												{isProfitable ? (
													<TrendingUp className="h-4 w-4 text-green-500" />
												) : (
													<TrendingDown className="h-4 w-4 text-destructive" />
												)}
												<p className={cn(
													"font-mono font-semibold",
													isProfitable ? "text-green-500" : "text-destructive"
												)}>
													${formatNumber(Math.abs(item.unrealizedPnl))}
												</p>
											</div>
											<p className={cn(
												"font-mono text-xs",
												isProfitable ? "text-green-500" : "text-destructive"
											)}>
												{isProfitable ? "+" : ""}{pnlPercentage.toFixed(2)}%
											</p>
										</div>
									</td>
								</tr>
							)
						})}
					</tbody>
				</table>
			</div>
			<div className="flex items-center justify-between p-4 border-t border-border">
				<div className="flex items-center gap-2">
					<Switch
						id="hide-small-balance"
						checked={hideSmallBalance}
						onCheckedChange={onHideSmallBalanceChange}
					/>
					<label
						htmlFor="hide-small-balance"
						className="font-mono text-sm text-muted-foreground cursor-pointer"
					>
						Hide small balances (&lt; $1)
					</label>
				</div>
				<div className="font-mono text-xs text-muted-foreground">
					Showing {sortedBalances.length} of {portfolio.balances.length} tokens
				</div>
			</div>
		</Card>
	)
}