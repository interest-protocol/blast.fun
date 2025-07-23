"use client"

import { formatDistance } from "date-fns"
import { Globe, Send, Twitter } from "lucide-react"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { TokenAvatar } from "./token-avatar"
import type { PoolWithMetadata } from "@/types/pool"
import { formatAmountWithSuffix, calculateMarketCap } from "@/utils/format"
import { formatAddress } from "@mysten/sui/utils"
import { CopyableToken } from "../shared/copyable-token"
import { CreatorHoverCard } from "@/components/creator/creator-hover-card"

interface TokenCardProps {
	pool: PoolWithMetadata
}

export function TokenCard({ pool }: TokenCardProps) {
	const metadata = pool.metadata || {}
	const coinMetadata = pool.coinMetadata
	const marketCap = calculateMarketCap(pool)
	const bondingProgress = parseFloat(pool.bondingCurve)

	// Creator info from metadata
	const creatorTwitterId = metadata.CreatorTwitterId
	const creatorTwitterName = metadata.CreatorTwitterName
	const creatorWallet = metadata.CreatorWallet || pool.creatorAddress
	const showTwitterCreator = creatorTwitterId && creatorTwitterName

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
		<Link href={`/pool/${pool.poolId}`} className="cursor-default">
			<div className="relative border-b border-border/40 group hover:bg-accent/15 transition-all duration-300 overflow-hidden">
				{/* Bonding Progress Gradient */}
				<div className="absolute inset-0 opacity-[0.05] group-hover:opacity-[0.08] transition-opacity duration-300">
					<div
						className={`h-full transition-all duration-1000 ${bondingProgress >= 80 ? "bg-gradient-to-r from-orange-500 to-orange-400" : bondingProgress >= 50 ? "bg-gradient-to-r from-yellow-500 to-yellow-400" : "bg-gradient-to-r from-purple-500 to-purple-400"}`}
						style={{ width: `${bondingProgress}%` }}
					/>
				</div>

				{/* Content */}
				<div className="relative p-3 sm:p-2">
					<div className="flex gap-3 sm:gap-2.5">
						<div className="flex-shrink-0">
							<div className="relative">
								<div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
								<TokenAvatar
									iconUrl={coinMetadata?.iconUrl || undefined}
									symbol={coinMetadata?.symbol}
									name={coinMetadata?.name}
									className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 border-border/20 group-hover:border-primary/30 transition-all duration-300 shadow-sm"
								/>
							</div>
						</div>

						{/* Content Area */}
						<div className="flex-1 min-w-0 space-y-1">
							{/* Header */}
							<div className="flex items-center gap-2">
								<h3 className="font-mono font-bold text-xs sm:text-sm uppercase tracking-wider text-foreground/90 truncate">
									{coinMetadata?.name || "[UNNAMED]"}
								</h3>
								<CopyableToken symbol={coinMetadata?.symbol || "[???]"} coinType={pool.coinType} className="ml-auto text-xs" />
							</div>

							{/* Stats */}
							<div className="flex items-center gap-2 sm:gap-3 text-xs font-mono">
								<Tooltip>
									<TooltipTrigger asChild>
										<div className="flex items-center gap-1">
											<span className="text-muted-foreground/60 uppercase tracking-wider text-[9px] sm:text-[10px]">MC</span>
											<span className="font-semibold text-green-500/90 text-[11px] sm:text-xs">${formatAmountWithSuffix(marketCap)}</span>
										</div>
									</TooltipTrigger>
									<TooltipContent>
										<p className="text-xs font-mono uppercase">MARKET::CAP</p>
									</TooltipContent>
								</Tooltip>

								<Tooltip>
									<TooltipTrigger asChild>
										<div className="flex items-center gap-1">
											<span className="text-muted-foreground/60 uppercase tracking-wider text-[9px] sm:text-[10px]">LIQ</span>
											<span className="font-semibold text-blue-500/90 text-[11px] sm:text-xs">${formatAmountWithSuffix(pool.quoteBalance)}</span>
										</div>
									</TooltipTrigger>
									<TooltipContent>
										<p className="text-xs font-mono uppercase">LIQUIDITY::POOL</p>
									</TooltipContent>
								</Tooltip>

								<Tooltip>
									<TooltipTrigger asChild>
										<div className="flex items-center gap-1 sm:gap-1.5">
											<span className="text-muted-foreground/60 uppercase tracking-wider text-[9px] sm:text-[10px] hidden sm:inline">BOND</span>
											<div className="flex items-center gap-1 sm:gap-1.5">
												<div className="w-12 sm:w-16 h-1.5 bg-secondary/30 rounded-full overflow-hidden">
													<div
														className={`h-full transition-all duration-500 ${bondingProgress >= 80 ? "bg-gradient-to-r from-orange-500 to-orange-400" : bondingProgress >= 50 ? "bg-gradient-to-r from-yellow-500 to-yellow-400" : "bg-gradient-to-r from-purple-500 to-purple-400"}`}
														style={{ width: `${bondingProgress}%` }}
													/>
												</div>
												<span className={`font-semibold text-[11px] sm:text-xs ${bondingProgress >= 80 ? "text-orange-500/90" : bondingProgress >= 50 ? "text-yellow-500/90" : "text-purple-500/90"}`}>{bondingProgress.toFixed(0)}%</span>
											</div>
										</div>
									</TooltipTrigger>
									<TooltipContent>
										<p className="text-xs font-mono uppercase">BONDING::CURVE::PROGRESS</p>
									</TooltipContent>
								</Tooltip>
							</div>

							{/* Creator, Date & Social Links */}
							<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-mono">
								<div className="flex items-center gap-1.5">
									<span className="text-muted-foreground/60 uppercase font-medium tracking-wide">{createdDate}</span>
									<span className="text-muted-foreground/40 hidden sm:inline">·</span>
									<div className="flex items-center gap-1">
										<span className="text-muted-foreground/60 uppercase tracking-wide hidden sm:inline">by</span>
										<CreatorHoverCard
											twitterHandle={showTwitterCreator ? creatorTwitterName : undefined}
											walletAddress={!showTwitterCreator ? creatorWallet : undefined}
										>
											{showTwitterCreator ? (
												<button
													onClick={(e) => {
														e.stopPropagation()
														e.preventDefault()
														window.open(`https://twitter.com/${creatorTwitterName}`, "_blank", "noopener,noreferrer")
													}}
													className="hover:underline text-foreground/70 hover:text-foreground transition-colors text-left"
												>
													@{creatorTwitterName}
												</button>
											) : (
												<span className="text-foreground/70 hover:text-foreground transition-colors">
													{formatAddress(creatorWallet)}
												</span>
											)}
										</CreatorHoverCard>
									</div>
								</div>
								{socialLinks.length > 0 && (
									<div className="flex items-center gap-1">
										<span className="text-muted-foreground/40 hidden sm:inline">·</span>
										<div className="flex items-center gap-1">
											{socialLinks.map((link, index) => {
												const Icon = link.icon
												return (
													<Tooltip key={index}>
														<TooltipTrigger asChild>
															<button
																onClick={(e) => {
																	e.stopPropagation()
																	e.preventDefault()
																	window.open(link.href, "_blank", "noopener,noreferrer")
																}}
																className="text-muted-foreground/60 hover:text-foreground/80 transition-all p-0.5 hover:bg-accent/20 rounded-md"
															>
																<Icon className="w-3 h-3" />
															</button>
														</TooltipTrigger>
														<TooltipContent>
															<p className="text-xs font-mono uppercase">{link.tooltip}</p>
														</TooltipContent>
													</Tooltip>
												)
											})}
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</Link>
	)
}
