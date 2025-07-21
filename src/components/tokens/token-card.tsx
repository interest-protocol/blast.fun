"use client"

import { formatDistance } from "date-fns"
import { Globe, Send, Twitter } from "lucide-react"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { TokenAvatar } from "./token-avatar"
import type { PoolWithMetadata } from "@/types/pool"
import { formatAmountWithSuffix } from "@/utils/format"
import { CopyableToken } from "../shared/copyable-token"

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
		{ href: metadata.Telegram, icon: Send, tooltip: "TELEGRAM::CHAT" },
		{ href: metadata.Website, icon: Globe, tooltip: "WEBSITE::LINK" },
	].filter((link) => link.href)

	let createdDate = "[UNKNOWN]"
	if (pool.createdAt) {
		try {
			const timestamp = typeof pool.createdAt === "string" ? parseInt(pool.createdAt) : pool.createdAt
			const date = new Date(timestamp)

			if (!isNaN(date.getTime())) {
				createdDate = formatDistance(date, new Date(), { addSuffix: true }).toUpperCase()
			}
		} catch (error) {
			console.warn("Invalid date format for createdAt:", pool.createdAt)
		}
	}

	return (
		<Link href={`/pool/${pool.poolId}`}>
			<div className="border-b border-border/40 group p-2 hover:bg-accent/5 transition-all duration-200">
				<div className="flex gap-2.5">
					{/* Token Image */}
					<div className="flex-shrink-0">
						<div className="relative">
							<div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
							<TokenAvatar
								iconUrl={coinMetadata?.iconUrl || undefined}
								symbol={coinMetadata?.symbol}
								name={coinMetadata?.name}
								className="relative w-14 h-14 rounded-lg border-2 border-border/30 group-hover:border-primary/40 transition-all duration-200"
							/>
						</div>
					</div>

					{/* Content Area */}
					<div className="flex-1 min-w-0 space-y-1">
						{/* Header */}
						<div className="flex items-center gap-2">
							<h3 className="font-mono font-bold text-sm uppercase tracking-wider text-foreground/90 truncate">
								{coinMetadata?.name || "[UNNAMED]"}
							</h3>
							<CopyableToken symbol={coinMetadata?.symbol || "[???]"} coinType={pool.coinType} className="ml-auto" />
						</div>

						{/* Stats */}
						<div className="flex items-center gap-2.5 text-xs font-mono">
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="flex items-center gap-1">
										<span className="text-muted-foreground/80 uppercase tracking-wider">MC</span>
										<span className="font-medium text-green-500/80">${formatAmountWithSuffix(marketCap)}</span>
									</div>
								</TooltipTrigger>
								<TooltipContent>
									<p className="text-xs font-mono uppercase">MARKET::CAP</p>
								</TooltipContent>
							</Tooltip>

							<Tooltip>
								<TooltipTrigger asChild>
									<div className="flex items-center gap-1">
										<span className="text-muted-foreground/80 uppercase tracking-wider">LIQ</span>
										<span className="font-medium text-blue-500/80">${formatAmountWithSuffix(pool.quoteBalance)}</span>
									</div>
								</TooltipTrigger>
								<TooltipContent>
									<p className="text-xs font-mono uppercase">LIQUIDITY::POOL</p>
								</TooltipContent>
							</Tooltip>

							<Tooltip>
								<TooltipTrigger asChild>
									<div className="flex items-center gap-1">
										<span className="text-muted-foreground/80 uppercase tracking-wider">BOND</span>
										<div className="flex items-center gap-1">
											<div className="w-14 h-1 bg-secondary/40 rounded-full overflow-hidden">
												<div
													className={`h-full transition-all duration-500 ${bondingProgress >= 80 ? "bg-orange-500/70" : bondingProgress >= 50 ? "bg-yellow-500/70" : "bg-purple-500/70"}`}
													style={{ width: `${bondingProgress}%` }}
												/>
											</div>
											<span className={`font-medium ${bondingProgress >= 80 ? "text-orange-500/80" : bondingProgress >= 50 ? "text-yellow-500/80" : "text-purple-500/80"}`}>{bondingProgress.toFixed(0)}%</span>
										</div>
									</div>
								</TooltipTrigger>
								<TooltipContent>
									<p className="text-xs font-mono uppercase">BONDING::CURVE::PROGRESS</p>
								</TooltipContent>
							</Tooltip>
						</div>

						{/* Social Links & Date */}
						<div className="flex items-center gap-1.5 text-xs font-mono">
							<span className="text-muted-foreground/80 uppercase font-semibold tracking-tight">{createdDate}</span>
							{socialLinks.length > 0 && (
								<>
									<span className="text-muted-foreground">•</span>
									<div className="flex items-center gap-0.5">
										{socialLinks.map((link, index) => {
											const Icon = link.icon
											return (
												<Tooltip key={index}>
													<TooltipTrigger asChild>
														<a
															href={link.href}
															target="_blank"
															rel="noopener noreferrer"
															className="text-muted-foreground/80 hover:text-foreground/80 transition-colors p-0.5 hover:bg-accent/30 rounded"
															onClick={(e) => e.stopPropagation()}
														>
															<Icon className="w-3 h-3" />
														</a>
													</TooltipTrigger>
													<TooltipContent>
														<p className="text-xs font-mono uppercase">{link.tooltip}</p>
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
