"use client"

import { Copy, ExternalLink, Globe, Send, Twitter, User } from "lucide-react"
import React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useClipboard } from "@/hooks/use-clipboard"
import type { PoolWithMetadata } from "@/types/pool"
import { formatAmountWithSuffix } from "@/utils/format"

interface PoolHeaderProps {
	pool: PoolWithMetadata
}

export function PoolHeader({ pool }: PoolHeaderProps) {
	const { copy } = useClipboard()
	const metadata = pool.coinMetadata
	const decimals = metadata?.decimals || 9

	const supply = pool.coinBalance

	console.log(pool)

	// Calculate bonding curve progress
	const progress = typeof pool.bondingCurve === "number" ? pool.bondingCurve : parseFloat(pool.bondingCurve) || 0

	// Calculate market cap (approximate based on liquidity and progress)
	const currentLiquidity = Number(pool.quoteBalance) / Math.pow(10, 9)
	const marketCap = currentLiquidity * (100 / (progress || 1)) // Rough estimate

	// Format creator info from metadata
	// Priority: CreatorTwitterName (if CreatorTwitterId exists) > CreatorWallet > pool.creatorAddress
	const creatorTwitterId = pool.metadata?.CreatorTwitterId
	const creatorTwitterName = pool.metadata?.CreatorTwitterName
	const creatorWallet = pool.metadata?.CreatorWallet || pool.creatorAddress
	const showTwitterCreator = creatorTwitterId && creatorTwitterName

	return (
		<div className="border-2 bg-background/50 backdrop-blur-sm shadow-2xl p-2 rounded-xl overflow-hidden">
			<div className="flex items-center gap-4">
				{/* Token Avatar */}
				<Avatar className="w-12 h-12 rounded-lg border border-border">
					<AvatarImage src={metadata?.iconUrl || ""} alt={metadata?.symbol} />
					<AvatarFallback className="font-mono text-xs uppercase bg-background">
						{metadata?.symbol?.slice(0, 2) || "??"}
					</AvatarFallback>
				</Avatar>

				{/* Token Info */}
				<div className="flex-1">
					<div className="flex items-center gap-2">
						<h1 className="text-lg font-bold font-mono uppercase tracking-wider">
							{metadata?.name || "[UNNAMED]"}
						</h1>
						<span className="font-mono text-sm text-muted-foreground">${metadata?.symbol || "[???]"}</span>
						{pool.migrated && (
							<Badge variant="default" className="font-mono text-xs uppercase h-5">
								Migrated
							</Badge>
						)}
					</div>

					{/* Contract and Creator on same line */}
					<div className="flex items-center gap-4 mt-1">
						<div className="flex items-center gap-1 text-xs font-mono font-bold text-muted-foreground">
							<span>by</span>
							{showTwitterCreator ? (
								<a
									href={`https://twitter.com/${creatorTwitterName}`}
									target="_blank"
									rel="noopener noreferrer"
									className="hover:underline text-foreground flex items-center gap-1"
								>
									@{creatorTwitterName}
								</a>
							) : (
								<span className="text-foreground">
									{creatorWallet.slice(0, 6)}...{creatorWallet.slice(-4)}
								</span>
							)}
						</div>
					</div>
				</div>

				{/* Stats Section */}
				<div className="flex items-center gap-6">
					{/* Market Cap */}
					<div>
						<p className="font-mono text-xs uppercase text-muted-foreground">Market Cap</p>
						<p className="font-mono text-sm font-bold">${marketCap.toLocaleString()}</p>
					</div>

					{/* Liquidity */}
					<div>
						<p className="font-mono text-xs uppercase text-muted-foreground">Liquidity</p>
						<p className="font-mono text-sm font-bold">{currentLiquidity.toLocaleString()} SUI</p>
					</div>

					{/* Supply */}
					<div>
						<p className="font-mono text-xs uppercase text-muted-foreground">Supply</p>
						<p className="font-mono text-sm font-bold">{formatAmountWithSuffix(supply)}</p>
					</div>

					{/* Social Links */}
					<div className="flex gap-1">
						{pool.metadata?.X && (
							<Button variant="ghost" size="icon" className="h-8 w-8" asChild>
								<a href={`https://twitter.com/${pool.metadata.X}`} target="_blank" rel="noopener noreferrer">
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
