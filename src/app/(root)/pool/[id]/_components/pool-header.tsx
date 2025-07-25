"use client"

import { Globe, Send, Twitter } from "lucide-react"
import React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { PoolWithMetadata } from "@/types/pool"
import { formatAmountWithSuffix, calculateMarketCap } from "@/utils/format"
import { CopyableToken } from "@/components/shared/copyable-token"
import { CreatorHoverCard } from "@/components/creator/creator-hover-card"
import { CreatorDisplay } from "@/components/creator/creator-display"

interface PoolHeaderProps {
	pool: PoolWithMetadata
}

export function PoolHeader({ pool }: PoolHeaderProps) {
	const metadata = pool.coinMetadata
	const supply = pool.coinBalance
	const currentLiquidity = Number(pool.quoteBalance) / Math.pow(10, 9)
	const marketCap = calculateMarketCap(pool)

	// Format creator info from metadata
	// Priority: CreatorTwitterName (if CreatorTwitterId exists) > CreatorWallet > pool.creatorAddress
	const creatorTwitterId = pool.metadata?.CreatorTwitterId
	const creatorTwitterName = pool.metadata?.CreatorTwitterName
	const creatorWallet = pool.metadata?.CreatorWallet || pool.creatorAddress
	const showTwitterCreator = creatorTwitterId && creatorTwitterName

	return (
		<div className="border-2 shadow-lg rounded-xl p-3 sm:p-2 overflow-hidden">
			<div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 select-none">
				{/* Token Avatar and Info - Mobile First Row */}
				<div className="flex items-center gap-3 w-full sm:w-auto">
					<Avatar className="w-12 h-12 rounded-lg border border-border flex-shrink-0">
						<AvatarImage src={metadata?.iconUrl || ""} alt={metadata?.symbol} />
						<AvatarFallback className="font-mono text-xs uppercase bg-background">
							{metadata?.symbol?.slice(0, 2) || "??"}
						</AvatarFallback>
					</Avatar>

					{/* Token Info */}
					<div className="flex-1 min-w-0">
						<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
							<h1 className="text-base sm:text-lg font-bold font-mono uppercase tracking-wider truncate">
								{metadata?.name || "[UNNAMED]"}
							</h1>

							<div className="flex items-center gap-2">
								<CopyableToken symbol={metadata?.symbol || "[???]"} coinType={pool.coinType} className="text-xs" />
								{pool.migrated && (
									<Badge variant="default" className="font-mono text-xs uppercase h-5">
										Migrated
									</Badge>
								)}
							</div>
						</div>

						<div className="flex items-center gap-1 text-xs font-mono font-bold text-muted-foreground">
							<span>by</span>
							<CreatorHoverCard
								twitterHandle={showTwitterCreator ? creatorTwitterName : undefined}
								walletAddress={creatorWallet}
							>
								<span>
									<CreatorDisplay
										twitterHandle={showTwitterCreator ? creatorTwitterName : undefined}
										walletAddress={creatorWallet}
										className="text-foreground hover:text-foreground/80 transition-colors"
									/>
								</span>
							</CreatorHoverCard>
						</div>
					</div>
				</div>

				{/* Stats and Social - Mobile Second Row */}
				<div className="flex flex-col sm:flex-row sm:flex-1 sm:justify-end gap-3 sm:gap-6 w-full sm:w-auto">
					{/* Stats Grid */}
					<div className="grid grid-cols-3 gap-3 sm:flex sm:items-center sm:gap-6">
						<div>
							<p className="font-mono text-[10px] sm:text-xs uppercase text-muted-foreground">Market Cap</p>
							<p className="font-mono text-xs sm:text-sm font-bold">${formatAmountWithSuffix(marketCap)}</p>
						</div>

						<div>
							<p className="font-mono text-[10px] sm:text-xs uppercase text-muted-foreground">Liquidity</p>
							<p className="font-mono text-xs sm:text-sm font-bold">{currentLiquidity.toLocaleString()} SUI</p>
						</div>

						<div>
							<p className="font-mono text-[10px] sm:text-xs uppercase text-muted-foreground">Supply</p>
							<p className="font-mono text-xs sm:text-sm font-bold">{formatAmountWithSuffix(supply)}</p>
						</div>
					</div>

					{/* Social Links */}
					<div className="flex gap-1 justify-end">
						{pool.metadata?.X && (
							<Button variant="ghost" size="icon" className="h-8 w-8" asChild>
								<a href={pool.metadata.X} target="_blank" rel="noopener noreferrer">
									<Twitter className="h-4 w-4" />
								</a>
							</Button>
						)}
						{pool.metadata?.Telegram && (
							<Button variant="ghost" size="icon" className="h-8 w-8" asChild>
								<a href={pool.metadata.Telegram} target="_blank" rel="noopener noreferrer">
									<Send className="h-4 w-4" />
								</a>
							</Button>
						)}
						{pool.metadata?.Website && (
							<Button variant="ghost" size="icon" className="h-8 w-8" asChild>
								<a href={pool.metadata.Website} target="_blank" rel="noopener noreferrer">
									<Globe className="h-4 w-4" />
								</a>
							</Button>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
