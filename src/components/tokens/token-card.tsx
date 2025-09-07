"use client"

import { memo } from "react"
import { Users, Globe, Send } from "lucide-react"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { TokenAvatar } from "./token-avatar"
import type { Token } from "@/types/token"
import { formatNumberWithSuffix } from "@/utils/format"
import { CopyableToken } from "../shared/copyable-token"
import { CreatorHoverCard } from "@/components/creator/creator-hover-card"
import { CreatorDisplay } from "@/components/creator/creator-display"
import { RelativeAge } from "@/components/shared/relative-age"
import { ProtectionBadges } from "@/components/shared/protection-badges"
import { useTokenProtection } from "@/hooks/use-token-protection"
import { BsTwitterX } from "react-icons/bs"

interface TokenCardProps {
	pool: Token | any // @dev: Support both new Token type and legacy format
}

export const TokenCard = memo(function TokenCard({
	pool: tokenData
}: TokenCardProps) {
	// @dev: Normalize data structure - support both new Token type and legacy format
	const token = tokenData.market ? tokenData : {
		...tokenData,
		market: { 
			bondingProgress: tokenData.bondingProgress || 0,
			marketCap: tokenData.marketCap || 0,
			volume24h: tokenData.volume24h || tokenData.volume || 0,
			holdersCount: tokenData.holdersCount || 0
		},
		metadata: tokenData.metadata || {
			name: tokenData.name,
			symbol: tokenData.symbol,
			icon_url: tokenData.iconUrl || tokenData.icon_url,
			X: tokenData.metadata?.X,
			Telegram: tokenData.metadata?.Telegram,
			Website: tokenData.metadata?.Website
		},
		creator: tokenData.creator || tokenData.creatorData || {
			address: tokenData.dev || tokenData.creatorAddress,
			launchCount: tokenData.creatorData?.launchCount || 0,
			trustedFollowers: tokenData.creatorData?.trustedFollowers || "0",
			followers: tokenData.creatorData?.followers || "0",
			twitterHandle: tokenData.creatorData?.twitterHandle,
			twitterId: tokenData.creatorData?.twitterId
		},
		pool: tokenData.pool || {
			poolId: tokenData.poolId,
			isProtected: tokenData.isProtected,
			burnTax: tokenData.burnTax
		}
	}
	
	// @dev: get protection settings if pool is protected
	const { settings: protectionSettings } = useTokenProtection(
		token.pool?.poolId || "", 
		token.pool?.isProtected || false
	)
	
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
			<div className="relative border-b border-border/40 group hover:bg-accent/15 transition-all duration-300 overflow-hidden">
				{/* Content */}
				<div className="relative p-3 sm:p-2">
					<div className="flex gap-3 sm:gap-2.5">
						<div className="flex-shrink-0">
							<div className="w-[48px] sm:w-[56px] h-[48px] sm:h-[56px] flex flex-col items-center justify-start">
								{/* avatar with conic progress */}
								<div className={`relative overflow-hidden rounded-md flex-shrink-0 ${
									isGraduated 
										? 'w-[48px] sm:w-[56px] h-[48px] sm:h-[56px]' 
										: 'w-[48px] sm:w-[56px] h-[38px] sm:h-[44px]'
								}`}>
									<div className="relative w-full h-full">
										{/* background for incomplete progress */}
										<div className={`absolute inset-0 rounded-md ${bondingProgress >= 100
											? 'bg-gradient-to-br from-yellow-600/30 to-amber-600/30' // True gold for graduated
											: bondingProgress >= 30
												? 'bg-gradient-to-br from-pink-400/30 to-rose-500/30' // Pink for near graduation
												: 'bg-gradient-to-br from-blue-400/30 to-cyan-500/30' // Blue for new
										}`} />

										{/* gradient conic progress */}
										<div
											className="absolute inset-0 rounded-md"
											style={{
												background: `conic-gradient(${bondingProgress >= 100
													? 'rgb(202, 138, 4)' // True gold color
													: bondingProgress >= 30
														? 'rgb(236, 72, 153)' // Pink for near graduation
														: 'rgb(59, 130, 246)' // Blue
												} ${Math.min(bondingProgress, 100)}%, transparent ${Math.min(bondingProgress, 100)}%)`
											}}
										/>

										<div className="absolute inset-[3px] rounded overflow-hidden bg-background flex items-center justify-center">
											<TokenAvatar
												iconUrl={token.metadata?.icon_url || tokenData.iconUrl || tokenData.icon_url}
												symbol={token.metadata?.symbol || tokenData.symbol}
												name={token.metadata?.name || tokenData.name}
												className="w-full h-full object-cover"
												fallbackClassName="w-full h-full flex items-center justify-center"
												enableHover={true}
											/>
										</div>
									</div>
								</div>

								{!isGraduated && (
									<div className="flex items-center justify-center w-full mt-1">
										<p className={`text-[10px] font-mono font-semibold ${
											bondingProgress >= 30
												? 'text-pink-500/80'
												: 'text-blue-500/80'
										}`}>
											{bondingProgress.toFixed(1)}%
										</p>
									</div>
								)}
							</div>
						</div>

						{/* Content */}
						<div className="flex-1 min-w-0 space-y-1">
							<div className="flex items-center gap-2">
								<h3 className="font-mono font-bold text-xs sm:text-sm uppercase tracking-wider text-foreground/90 truncate">
									{token.metadata?.name || tokenData.name || "[UNNAMED]"}
								</h3>
								
								{/* Protection Badges */}
								{(token.pool?.isProtected || protectionSettings || (typeof token.pool?.burnTax === 'number' && token.pool?.burnTax > 0)) && (
									<ProtectionBadges 
										protectionSettings={protectionSettings}
										isProtected={token.pool?.isProtected}
										burnTax={token.pool?.burnTax}
										size="sm"
									/>
								)}
								
								<CopyableToken symbol={token.metadata?.symbol || tokenData.symbol || "[???]"} coinType={tokenData.coinType} className="ml-auto text-xs" />
							</div>

							{/* stats */}
							<div className="flex items-center gap-2 sm:gap-3 text-xs font-mono flex-wrap">
								{(token.market?.marketCap || tokenData.marketCap) > 0 && (
									<Tooltip>
										<TooltipTrigger asChild>
											<div className="flex items-center gap-1">
												<span className="text-muted-foreground/60 uppercase tracking-wider text-[9px] sm:text-[10px]">MC</span>
												<span className="font-semibold text-green-500/90 text-[11px] sm:text-xs">
													${formatNumberWithSuffix(token.market?.marketCap || tokenData.marketCap)}
												</span>
											</div>
										</TooltipTrigger>
										<TooltipContent>
											<p className="text-xs font-mono uppercase">MARKET::CAP</p>
										</TooltipContent>
									</Tooltip>
								)}

								{(token.market?.volume24h || tokenData.volume24h) > 0 && (
									<Tooltip>
										<TooltipTrigger asChild>
											<div className="flex items-center gap-1">
												<span className="text-muted-foreground/60 uppercase tracking-wider text-[9px] sm:text-[10px]">VOL</span>
												<span className="font-semibold text-purple-500/90 text-[11px] sm:text-xs">
													${formatNumberWithSuffix(token.market?.volume24h || tokenData.volume24h)}
												</span>
											</div>
										</TooltipTrigger>
										<TooltipContent>
											<p className="text-xs font-mono uppercase">24H::VOLUME</p>
										</TooltipContent>
									</Tooltip>
								)}

								{(token.market?.holdersCount || tokenData.holdersCount) > 0 && (
									<Tooltip>
										<TooltipTrigger asChild>
											<div className="flex items-center gap-1">
												<Users className="w-3 h-3 text-muted-foreground/60" />
												<span className="font-semibold text-foreground/70 text-[11px] sm:text-xs">
													{formatNumberWithSuffix(token.market?.holdersCount || tokenData.holdersCount)}
												</span>
											</div>
										</TooltipTrigger>
										<TooltipContent>
											<p className="text-xs font-mono uppercase">HOLDERS</p>
										</TooltipContent>
									</Tooltip>
								)}
							</div>

							{/* Creator, Date & Social Links */}
							<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-mono">
								<div className="flex items-center gap-1.5">
									<RelativeAge
										timestamp={tokenData.createdAt}
										className="text-muted-foreground/60 uppercase font-medium tracking-wide"
									/>
									<span className="text-muted-foreground/40 hidden sm:inline">·</span>
									<div className="flex items-center gap-1">
										<span className="text-muted-foreground/60 uppercase tracking-wide hidden sm:inline">by</span>
										<CreatorHoverCard
											walletAddress={token.creator?.address || tokenData.dev || tokenData.creatorAddress}
											twitterHandle={token.creator?.twitterHandle || tokenData.creatorData?.twitterHandle || undefined}
											twitterId={token.creator?.twitterId || tokenData.creatorData?.twitterId || undefined}
											data={token.creator || tokenData.creatorData}
										>
											<span>
												<CreatorDisplay
													walletAddress={token.creator?.address || tokenData.dev || tokenData.creatorAddress}
													twitterHandle={token.creator?.twitterHandle || tokenData.creatorData?.twitterHandle || undefined}
													twitterId={token.creator?.twitterId || tokenData.creatorData?.twitterId || undefined}
													className="text-foreground/80 hover:text-foreground transition-colors cursor-pointer"
												/>
											</span>
										</CreatorHoverCard>
									</div>
								</div>

								{/* Social Links */}
								{socialLinks.length > 0 && (
									<>
										<span className="text-muted-foreground/40 hidden sm:inline">·</span>
										<div className="flex items-center gap-1.5">
											{socialLinks.map((link, index) => (
												<Tooltip key={index}>
													<TooltipTrigger asChild>
														<a
															href={link.href}
															target="_blank"
															rel="noopener noreferrer"
															onClick={(e) => e.stopPropagation()}
															className="text-muted-foreground/60 hover:text-primary transition-colors"
														>
															<link.icon className="w-3 h-3" />
														</a>
													</TooltipTrigger>
													<TooltipContent>
														<p className="text-xs font-mono uppercase">{link.tooltip}</p>
													</TooltipContent>
												</Tooltip>
											))}
										</div>
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</Link>
	)
})