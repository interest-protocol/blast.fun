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
		{ href: metadata.Website, icon: Globe, tooltip: "WEBSITE" }
	].filter(link => link.href)

	let createdDate = "[UNKNOWN]"
	if (pool.createdAt) {
		try {
			const timestamp = typeof pool.createdAt === 'string' ? parseInt(pool.createdAt) : pool.createdAt
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
			<div className="border-b bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all duration-300 group cursor-pointer p-2">
				<div className="flex gap-3">
					{/* Token Image */}
					<div className="flex-shrink-0">
						<div className="relative">
							<div className="absolute inset-0 bg-primary/20 blur-md rounded opacity-0 group-hover:opacity-100 transition-opacity" />
							<TokenAvatar
								iconUrl={coinMetadata?.iconUrl || undefined}
								symbol={coinMetadata?.symbol}
								name={coinMetadata?.name}
								className="relative w-12 h-12 rounded border"
							/>
						</div>
					</div>

					{/* Content Area */}
					<div className="flex-1 min-w-0 space-y-1">
						{/* Header */}
						<div className="flex items-center gap-2">
							<h3 className="font-mono text-sm uppercase tracking-wider text-foreground/80 truncate">
								{coinMetadata?.name || "[UNNAMED]"}
							</h3>
							<p className="font-mono text-xs uppercase text-muted-foreground">
								${coinMetadata?.symbol || "[???]"}
							</p>
						</div>

						{/* Stats */}
						<div className="flex items-center gap-3 text-xs font-mono">
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="flex items-center gap-1">
										<span className="text-muted-foreground uppercase">MC:</span>
										<span className="text-foreground">${formatAmountWithSuffix(marketCap)}</span>
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
										<span className="text-foreground">{formatAmountWithSuffix(pool.quoteBalance)}</span>
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
										<span className="text-foreground">{bondingProgress.toFixed(0)}%</span>
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
															className="text-muted-foreground hover:text-foreground transition-colors"
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
