"use client"

import { Globe, Send, Users } from "lucide-react"
import Link from "next/link"
import { memo } from "react"
import { BsTwitterX } from "react-icons/bs"
import { CreatorDisplay } from "@/components/creator/creator-display"
import { CreatorHoverCard } from "@/components/creator/creator-hover-card"
import { ProtectionBadges } from "@/components/shared/protection-badges"
import { RelativeAge } from "@/components/shared/relative-age"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useTokenProtection } from "@/hooks/use-token-protection"
import type { Token } from "@/types/token"
import { formatNumberWithSuffix } from "@/utils/format"
import { CopyableToken } from "../shared/copyable-token"
import { QuickBuy } from "./quick-buy"
import { TokenAvatar } from "./token-avatar"

interface TokenCardProps {
	pool: Token | any // @dev: Support both new Token type and legacy format
	hasRecentTrade?: boolean
	column?: 'newlyCreated' | 'nearGraduation' | 'graduated'
}

export const TokenCard = memo(function TokenCard({ pool: tokenData, hasRecentTrade = false, column }: TokenCardProps) {
	// @dev: Normalize data structure - support both new Token type and legacy format
	const token = tokenData.market
		? tokenData
		: {
				...tokenData,
				market: {
					bondingProgress: tokenData.bondingProgress || 0,
					marketCap: tokenData.marketCap || 0,
					volume24h: tokenData.volume24h || tokenData.volume || 0,
					holdersCount: tokenData.holdersCount || 0,
				},
				metadata: tokenData.metadata || {
					name: tokenData.name,
					symbol: tokenData.symbol,
					icon_url: tokenData.iconUrl || tokenData.icon_url,
					X: tokenData.metadata?.X,
					Telegram: tokenData.metadata?.Telegram,
					Website: tokenData.metadata?.Website,
				},
				creator: tokenData.creator ||
					tokenData.creatorData || {
						address: tokenData.dev || tokenData.creatorAddress,
						launchCount: tokenData.creatorData?.launchCount || 0,
						trustedFollowers: tokenData.creatorData?.trustedFollowers || "0",
						followers: tokenData.creatorData?.followers || "0",
						twitterHandle: tokenData.creatorData?.twitterHandle,
						twitterId: tokenData.creatorData?.twitterId,
					},
				pool: tokenData.pool || {
					poolId: tokenData.poolId,
					isProtected: tokenData.isProtected,
					burnTax: tokenData.burnTax,
				},
			}

	// @dev: get protection settings if pool is protected
	const { settings: protectionSettings } = useTokenProtection(token.pool?.poolId || "", token.pool?.isProtected || false)

	const bondingProgress = token.market?.bondingProgress || tokenData.bondingProgress || 0
	const isGraduated = bondingProgress >= 100 || token.pool?.migrated

	// @dev: Social links from metadata
	const socialLinks = [
		{ href: token.metadata?.X, icon: BsTwitterX, tooltip: "X" },
		{ href: token.metadata?.Telegram, icon: Send, tooltip: "TELEGRAM" },
		{ href: token.metadata?.Website, icon: Globe, tooltip: "WEBSITE" },
	].filter((link) => link.href)

	return (
		<Link href={`/token/${token.coinType}`} className="cursor-default">
			<div
				className={`group relative overflow-hidden border-border/40 border-b transition-all duration-300 hover:bg-accent/15 ${hasRecentTrade ? "animate-shake" : ""}`}
			>
				{/* Content */}
				<div className="relative p-3 sm:p-2">
					<div className="flex items-center gap-3 sm:gap-2.5">
						<div className="flex-shrink-0">
							<div className="h-[48px] w-[48px] sm:h-[56px] sm:w-[56px]">
								{/* avatar with conic progress */}
								<div className="relative h-[48px] w-[48px] flex-shrink-0 overflow-hidden rounded-md sm:h-[56px] sm:w-[56px]">
									<div className="relative h-full w-full">
										{/* background for incomplete progress */}
										<div
											className={`absolute inset-0 rounded-md ${
												bondingProgress >= 100
													? "bg-gradient-to-br from-yellow-600/30 to-amber-600/30" // True gold for graduated
													: bondingProgress >= 30
														? "bg-gradient-to-br from-pink-400/30 to-rose-500/30" // Pink for near graduation
														: "bg-gradient-to-br from-blue-400/30 to-cyan-500/30" // Blue for new
											}`}
										/>

										{/* gradient conic progress */}
										<div
											className="absolute inset-0 rounded-md"
											style={{
												background: `conic-gradient(${
													bondingProgress >= 100
														? "rgb(202, 138, 4)" // True gold color
														: bondingProgress >= 30
															? "rgb(236, 72, 153)" // Pink for near graduation
															: "rgb(59, 130, 246)" // Blue
												} ${Math.min(bondingProgress, 100)}%, transparent ${Math.min(bondingProgress, 100)}%)`,
											}}
										/>

										<div className="absolute inset-[3px] flex items-center justify-center overflow-hidden rounded bg-background">
											<TokenAvatar
												iconUrl={token.metadata?.icon_url || tokenData.iconUrl || tokenData.icon_url}
												symbol={token.metadata?.symbol || tokenData.symbol}
												name={token.metadata?.name || tokenData.name}
												className="h-full w-full object-cover"
												fallbackClassName="w-full h-full flex items-center justify-center"
												enableHover={true}
											/>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Content */}
						<div className="flex-1 min-w-0 space-y-1">
							<div className="flex items-center gap-2">
								<h3 className="font-mono font-bold text-xs sm:text-sm uppercase tracking-wider text-foreground/90 truncate">
									{token.metadata?.name || tokenData.name || "[UNNAMED]"}
								</h3>

								{/* Protection Badges */}
								{(token.pool?.isProtected ||
									protectionSettings ||
									(typeof token.pool?.burnTax === "number" && token.pool?.burnTax > 0)) && (
									<ProtectionBadges
										protectionSettings={protectionSettings}
										isProtected={token.pool?.isProtected}
										burnTax={token.pool?.burnTax}
										size="sm"
									/>
								)}
							</div>

							{/* stats */}
							<div className="flex flex-wrap items-center gap-2 font-mono text-xs sm:gap-3">
								{(token.market?.marketCap || tokenData.marketCap) > 0 && (
									<Tooltip>
										<TooltipTrigger asChild>
											<div className="flex items-center gap-1">
												<span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider sm:text-[10px]">
													MC
												</span>
												<span className="font-semibold text-[11px] text-green-500/90 sm:text-xs">
													${formatNumberWithSuffix(token.market?.marketCap || tokenData.marketCap)}
												</span>
											</div>
										</TooltipTrigger>
										<TooltipContent>
											<p className="font-mono text-xs uppercase">MARKET CAP</p>
										</TooltipContent>
									</Tooltip>
								)}

								{(token.market?.volume24h || tokenData.volume24h) > 0 && (
									<Tooltip>
										<TooltipTrigger asChild>
											<div className="flex items-center gap-1">
												<span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider sm:text-[10px]">
													VOL
												</span>
												<span className="font-semibold text-[11px] text-purple-500/90 sm:text-xs">
													${formatNumberWithSuffix(token.market?.volume24h || tokenData.volume24h)}
												</span>
											</div>
										</TooltipTrigger>
										<TooltipContent>
											<p className="font-mono text-xs uppercase">24H VOLUME</p>
										</TooltipContent>
									</Tooltip>
								)}

								{(token.market?.holdersCount || tokenData.holdersCount) > 0 && (
									<Tooltip>
										<TooltipTrigger asChild>
											<div className="flex items-center gap-1">
												<Users className="h-3 w-3 text-muted-foreground/60" />
												<span className="font-semibold text-[11px] text-foreground/70 sm:text-xs">
													{formatNumberWithSuffix(
														token.market?.holdersCount || tokenData.holdersCount
													)}
												</span>
											</div>
										</TooltipTrigger>
										<TooltipContent>
											<p className="font-mono text-xs uppercase">HOLDERS</p>
										</TooltipContent>
									</Tooltip>
								)}
							</div>

							{/* Creator, Date & Social Links */}
							<div className="flex flex-col gap-1 font-mono text-[10px] sm:flex-row sm:items-center sm:gap-1.5 sm:text-xs">
								<div className="flex items-center gap-1.5">
									<RelativeAge
										timestamp={tokenData.createdAt}
										className="font-medium text-muted-foreground/60 uppercase tracking-wide"
									/>
									<span className="hidden text-muted-foreground/40 sm:inline">·</span>
									<div className="flex items-center gap-1">
										<span className="hidden text-muted-foreground/60 uppercase tracking-wide sm:inline">
											by
										</span>
										<CreatorHoverCard
											walletAddress={
												token.creator?.address || tokenData.dev || tokenData.creatorAddress
											}
											twitterHandle={
												token.creator?.twitterHandle ||
												tokenData.creatorData?.twitterHandle ||
												undefined
											}
											twitterId={
												token.creator?.twitterId || tokenData.creatorData?.twitterId || undefined
											}
											data={token.creator || tokenData.creatorData}
										>
											<span>
												<CreatorDisplay
													walletAddress={
														token.creator?.address || tokenData.dev || tokenData.creatorAddress
													}
													twitterHandle={
														token.creator?.twitterHandle ||
														tokenData.creatorData?.twitterHandle ||
														undefined
													}
													twitterId={
														token.creator?.twitterId ||
														tokenData.creatorData?.twitterId ||
														undefined
													}
													className="cursor-pointer text-foreground/80 transition-colors hover:text-foreground"
												/>
											</span>
										</CreatorHoverCard>
									</div>
								</div>

								{/* Social Links */}
								{socialLinks.length > 0 && (
									<>
										<span className="hidden text-muted-foreground/40 sm:inline">·</span>
										<div className="flex items-center gap-1.5">
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
																className="text-muted-foreground/60 hover:text-primary transition-colors p-0.5 hover:bg-accent/20 rounded-md"
															>
																<Icon className="h-3 w-3" />
															</button>
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

						{/* Token Symbol & Quick Buy Buttons - Far Right */}
						<div className="flex-shrink-0 ml-auto flex flex-col items-end gap-2">
							<CopyableToken symbol={token.metadata?.symbol || tokenData.symbol || "[???]"} coinType={tokenData.coinType} className="text-xs" />
							<QuickBuy pool={token} column={column} />
						</div>
					</div>
				</div>
			</div>
		</Link>
	)
})
