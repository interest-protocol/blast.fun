"use client"

import { memo } from "react"
import { Users, Globe, Send } from "lucide-react"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { TokenAvatar } from "./token-avatar"
import type { PoolWithMetadata } from "@/types/pool"
import { formatNumberWithSuffix } from "@/utils/format"
import { CopyableToken } from "../shared/copyable-token"
import { CreatorHoverCard } from "@/components/creator/creator-hover-card"
import { CreatorDisplay } from "@/components/creator/creator-display"
import { useMarketData } from "@/hooks/use-market-data"
import { RelativeAge } from "@/components/shared/relative-age"
import { BsTwitterX } from "react-icons/bs"

interface TokenCardProps {
	pool: PoolWithMetadata
}

export const TokenCard = memo(function TokenCard({ pool }: TokenCardProps) {
	const { data: marketData, isLoading: marketLoading } = useMarketData(pool.coinType)

	const coinMetadata = marketData?.coinMetadata

	// use 0 as default while loading
	const marketCap = marketData?.marketCap || 0
	const totalLiquidityUsd = marketData?.liqUsd || 0
	const holdersCount = marketData?.holdersCount || 0
	const bondingProgress = parseFloat(pool.bondingCurve)

	const creatorWallet = pool.creatorAddress
	const creatorTwitterName = pool.metadata?.CreatorTwitterName || pool.metadata?.creatorTwitter

	// social links from metadata
	const metadata = pool.metadata || {}
	const socialLinks = [
		{ href: metadata.X, icon: BsTwitterX, tooltip: "X" },
		{ href: metadata.Telegram, icon: Send, tooltip: "TELEGRAM::CHAT" },
		{ href: metadata.Website, icon: Globe, tooltip: "WEBSITE::LINK" },
	].filter((link) => link.href)


	return (
		<Link href={`/meme/${pool.poolId}`} className="cursor-default">
			<div className="relative border-b border-border/40 group hover:bg-accent/15 transition-all duration-300 overflow-hidden">
				{/* Content */}
				<div className="relative p-3 sm:p-2">
					<div className="flex gap-3 sm:gap-2.5">
						<div className="flex-shrink-0">
							<div className="relative h-[48px] w-[48px] sm:h-[56px] sm:w-[56px] overflow-hidden rounded-md">
								<div className="relative w-full h-full">
									{/* Dimmed background for incomplete progress */}
									<div className={`absolute inset-0 rounded-md ${bondingProgress >= 80
										? 'bg-orange-500/30'
										: bondingProgress >= 50
											? 'bg-yellow-500/30'
											: 'bg-purple-500/30'
										}`} />
									{/* Conic gradient progress */}
									<div
										className="absolute inset-0 rounded-md"
										style={{
											background: `conic-gradient(${bondingProgress >= 80
												? 'rgb(251, 146, 60)'
												: bondingProgress >= 50
													? 'rgb(250, 204, 21)'
													: 'rgb(168, 85, 247)'
												} ${bondingProgress}%, transparent ${bondingProgress}%)`
										}}
									/>

									{/* Token Avatar */}
									<div className="absolute inset-[3px] rounded overflow-hidden">
										<TokenAvatar
											iconUrl={coinMetadata?.iconUrl || undefined}
											symbol={coinMetadata?.symbol}
											name={coinMetadata?.name}
											className="h-full w-full object-cover"
										/>
									</div>
								</div>
							</div>
						</div>

						{/* Content */}
						<div className="flex-1 min-w-0 space-y-1">
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
											<span className="font-semibold text-green-500/90 text-[11px] sm:text-xs transition-all duration-300">
												${formatNumberWithSuffix(marketCap)}
											</span>
										</div>
									</TooltipTrigger>
									<TooltipContent>
										<p className="text-xs font-mono uppercase">MARKET::CAP</p>
									</TooltipContent>
								</Tooltip>

								<Tooltip>
									<TooltipTrigger asChild>
										<div className="flex items-center gap-1">
											<Users className="w-3 h-3 text-muted-foreground/60" />
											<span className="font-semibold text-foreground/70 text-[11px] sm:text-xs">
												{marketLoading ? "..." : formatNumberWithSuffix(holdersCount)}
											</span>
										</div>
									</TooltipTrigger>
									<TooltipContent>
										<p className="text-xs font-mono uppercase">HOLDERS</p>
									</TooltipContent>
								</Tooltip>

								<Tooltip>
									<TooltipTrigger asChild>
										<div className="flex items-center gap-1">
											<span className="text-muted-foreground/60 uppercase tracking-wider text-[9px] sm:text-[10px]">LIQ</span>
											<span className="font-semibold text-blue-500/90 text-[11px] sm:text-xs transition-all duration-300">
												{marketLoading ? "..." : `$${formatNumberWithSuffix(totalLiquidityUsd)}`}
											</span>
										</div>
									</TooltipTrigger>
									<TooltipContent>
										<p className="text-xs font-mono uppercase">LIQUIDITY::POOL</p>
									</TooltipContent>
								</Tooltip>

							</div>

							{/* Creator, Date & Social Links */}
							<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-mono">
								<div className="flex items-center gap-1.5">
									<RelativeAge
										timestamp={pool.createdAt ? parseInt(pool.createdAt) : Date.now()}
										className="text-muted-foreground/60 uppercase font-medium tracking-wide"
									/>
									<span className="text-muted-foreground/40 hidden sm:inline">·</span>
									<div className="flex items-center gap-1">
										<span className="text-muted-foreground/60 uppercase tracking-wide hidden sm:inline">by</span>
										<CreatorHoverCard
											walletAddress={creatorWallet}
											twitterHandle={creatorTwitterName}
										>
											<span>
												<CreatorDisplay
													walletAddress={creatorWallet}
													twitterHandle={creatorTwitterName}
													className="text-foreground/70 hover:text-foreground transition-colors text-left"
												/>
											</span>
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
}, (prevProps, nextProps) => {
	// Custom comparison function for React.memo
	// Only re-render if these specific properties change
	return (
		prevProps.pool.poolId === nextProps.pool.poolId &&
		prevProps.pool.bondingCurve === nextProps.pool.bondingCurve &&
		prevProps.pool.createdAt === nextProps.pool.createdAt &&
		prevProps.pool.coinType === nextProps.pool.coinType &&
		JSON.stringify(prevProps.pool.metadata) === JSON.stringify(nextProps.pool.metadata)
	)
})