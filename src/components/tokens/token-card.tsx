"use client"

import { formatDistance } from "date-fns"
import { Globe, Send, Twitter } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { TokenAvatar } from "./token-avatar"
import type { PoolWithMetadata } from "@/types/pool"
import { formatAmountWithSuffix } from "@/utils/format"

interface TokenCardProps {
	pool: PoolWithMetadata
}

export function TokenCard({ pool }: TokenCardProps) {
	const metadata = pool.metadata || {}
	const coinMetadata = pool.coinMetadata
	const marketCap = parseFloat(pool.quoteBalance) * 2
	const bondingProgress = parseFloat(pool.bondingCurve)

	// social links configuration
	const socialLinks = [
		{ href: metadata.X, icon: Twitter, tooltip: "X::TWITTER" },
		{ href: metadata.Telegram, icon: Send, tooltip: "TELEGRAM" },
		{ href: metadata.Website, icon: Globe, tooltip: "WEBSITE" },
	].filter((link) => link.href)

	let createdDate = "[UNKNOWN]"
	if (pool.createdAt) {
		try {
			const timestamp = typeof pool.createdAt === "string" ? parseInt(pool.createdAt) : pool.createdAt
			const date = new Date(timestamp)

			if (!isNaN(date.getTime())) {
				createdDate = formatDistance(date, new Date(), { addSuffix: true })
			}
		} catch (error) {
			console.warn("Invalid date format for createdAt:", pool.createdAt)
		}
	}

	return (
		<Link href={`/pool/${pool.poolId}`}>
			<div className="border-b group p-2">
				<div className="flex gap-3">
					{/* Token Image */}
					<div className="flex-shrink-0">
						<div className="relative">
							<div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-blue-500/30 blur-md rounded opacity-0 group-hover:opacity-100 transition-all duration-300" />
							<TokenAvatar
								iconUrl={coinMetadata?.iconUrl || undefined}
								symbol={coinMetadata?.symbol}
								name={coinMetadata?.name}
								className="relative w-16 h-16 rounded border"
							/>
						</div>
					</div>

					{/* Content Area */}
					<div className="flex-1 min-w-0 space-y-1">
						{/* Header */}
						<div className="flex items-start gap-1">
							<h3 className="font-mono font-bold text-md uppercase tracking-wider text-foreground/80 truncate">
								{coinMetadata?.name || "[UNNAMED]"}
							</h3>
							<p className="font-mono text-xs uppercase text-muted-foreground">
								{coinMetadata?.symbol || "[???]"}
							</p>
						</div>

						{/* Stats */}
						<div className="flex items-center gap-3 font-semibold text-xs font-mono">
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="flex items-center gap-1">
										<span className="text-muted-foreground uppercase">MC:</span>
										<span className="text-green-500">${formatAmountWithSuffix(marketCap)}</span>
									</div>
								</TooltipTrigger>
								<TooltipContent>
									<p className="font-mono text-xs uppercase">MARKET::CAP</p>
								</TooltipContent>
							</Tooltip>

							<Tooltip>
								<TooltipTrigger asChild>
									<div className="flex items-center gap-1">
										<span className="text-muted-foreground uppercase">LIQ:</span>
										<span className="text-blue-500">{formatAmountWithSuffix(pool.quoteBalance)}</span>
									</div>
								</TooltipTrigger>
								<TooltipContent>
									<p className="font-mono text-xs uppercase">LIQUIDITY::POOL</p>
								</TooltipContent>
							</Tooltip>

							<Tooltip>
								<TooltipTrigger asChild>
									<div className="flex items-center gap-1">
										<span className="text-muted-foreground uppercase">BOND:</span>
										<span className={bondingProgress >= 80 ? "text-orange-500" : bondingProgress >= 50 ? "text-yellow-500" : "text-purple-500"}>{bondingProgress.toFixed(0)}%</span>
									</div>
								</TooltipTrigger>
								<TooltipContent>
									<p className="font-mono text-xs uppercase">BONDING::PROGRESS</p>
								</TooltipContent>
							</Tooltip>
						</div>

						{/* Social Links */}
						<div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
							<span className="text-foreground/60">{createdDate}</span>
							{socialLinks.length > 0 && (
								<>
									<span>•</span>
									<div className="flex items-center gap-1">
										{socialLinks.map((link, index) => {
											const Icon = link.icon
											return (
												<Tooltip key={index}>
													<TooltipTrigger asChild>
														<a
															href={link.href}
															target="_blank"
															rel="noopener noreferrer"
															className="text-muted-foreground hover:text-primary transition-colors"
															onClick={(e) => e.stopPropagation()}
														>
															<Icon className="w-3 h-3" />
														</a>
													</TooltipTrigger>
													<TooltipContent>
														<p className="font-mono text-xs uppercase">{link.tooltip}</p>
													</TooltipContent>
												</Tooltip>
											)
										})}
									</div>
								</>
							)}
						</div>
					</div>
				</div>
			</div>
		</Link>
	)
}
