"use client"

import { useState, useEffect } from "react"
import { useResolveSuiNSName } from "@mysten/dapp-kit"
import { formatAddress } from "@mysten/sui/utils"
import {
	Globe,
	Send,
} from "lucide-react"
import { BsTwitterX } from "react-icons/bs"
import { TokenAvatar } from "@/components/tokens/token-avatar"
import { CopyableAddress } from "@/components/shared/copyable-address"
import { cn } from "@/utils"
import { formatNumberWithSuffix, formatSmallPrice } from "@/utils/format"
import type { Token } from "@/types/token"
import { RelativeAge } from "@/components/shared/relative-age"
import { UpdateMetadataDialog } from "./update-metadata-dialog"
import { useApp } from "@/context/app.context"
import { useTokenProtection } from "@/hooks/use-token-protection"
import { ProtectionBadges } from "@/components/shared/protection-badges"
import { useCreator } from "@/hooks/use-creator"

interface TokenInfoEnhancedProps {
	pool: Token
	realtimePrice: number | null
	realtimeMarketCap?: number | null
}

export function TokenInfoEnhanced({ pool, realtimePrice, realtimeMarketCap }: TokenInfoEnhancedProps) {
	const [updateMetadataDialogOpen, setUpdateMetadataDialogOpen] = useState(false)
	const { isConnected, address } = useApp()
	const { settings: protectionSettings } = useTokenProtection(pool.pool?.poolId || "", pool.pool?.isProtected)
	
	// @dev: Fetch creator data individually for this coin
	const { data: creatorData, isLoading: creatorLoading } = useCreator(pool.coinType)

	const metadata = pool.metadata
	const marketData = pool.market
	
	// @dev: Merge fresh creator data with existing creator info
	const currentCreatorData = creatorData ? {
		...pool.creator,
		...creatorData
	} : pool.creator

	const creatorTwitterHandle = currentCreatorData?.twitterHandle
	const creatorTwitterId = currentCreatorData?.twitterId
	const creatorWallet = currentCreatorData?.address
	const showTwitterCreator = !!creatorTwitterHandle

	const { data: resolvedDomain } = useResolveSuiNSName(!showTwitterCreator && creatorWallet ? creatorWallet : null)

	const priceChange5m = marketData?.price5MinsAgo && marketData?.price
		? ((marketData.price - marketData.price5MinsAgo) / marketData.price5MinsAgo) * 100
		: null

	const priceChange1h = marketData?.price1HrAgo && marketData?.price
		? ((marketData.price - marketData.price1HrAgo) / marketData.price1HrAgo) * 100
		: null

	const priceChange4h = marketData?.price4HrAgo && marketData?.price
		? ((marketData.price - marketData.price4HrAgo) / marketData.price4HrAgo) * 100
		: null

	const priceChange24h = marketData?.price1DayAgo && marketData?.price
		? ((marketData.price - marketData.price1DayAgo) / marketData.price1DayAgo) * 100
		: null

	const volume24h = marketData?.volume24h || 0
	const basePrice = marketData?.price || 0
	const baseMarketCap = marketData?.marketCap || 0

	const currentPrice = realtimePrice || basePrice
	const currentMarketCap = realtimeMarketCap || baseMarketCap

	// @dev: Check if current user is the token creator
	const isCreator = isConnected && address && currentCreatorData?.address && address === currentCreatorData?.address

	return (
		<>
			<div className="bg-background">
				<div>
					<div className="p-2 flex gap-2">
						<div className="flex-shrink-0">
							<TokenAvatar
								iconUrl={metadata?.icon_url || ""}
								symbol={metadata?.symbol}
								name={metadata?.name}
								className="w-20 h-20 rounded-md"
								fallbackClassName="text-2xl"
							/>
						</div>

						{/* Token Details */}
						<div className="flex min-w-0 flex-1 flex-col overflow-hidden">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-1.5">
									<div className="rounded bg-accent/50 px-1.5 py-0.5 hover:bg-accent/70">
										<CopyableAddress
											address={pool.coinType}
											showLabel={false}
											className="text-xs"
										/>
									</div>

									{isCreator && (
										<button
											onClick={() => setUpdateMetadataDialogOpen(true)}
											className="rounded bg-accent/50 px-1.5 py-0.5 hover:bg-accent/70 hover:text-foreground/80 text-xs text-muted-foreground uppercase font-semibold transition-colors"
										>
											Edit
										</button>
									)}
								</div>

								{(showTwitterCreator || creatorWallet) && !creatorLoading && (
									<div className="flex items-center gap-1 text-xs">
										<span className="text-muted-foreground">by</span>
										{showTwitterCreator ? (
											<a
												href={creatorTwitterId ? `https://x.com/i/user/${creatorTwitterId}` : `https://x.com/${creatorTwitterHandle}`}
												target="_blank"
												rel="noopener noreferrer"
												className="font-medium text-foreground hover:text-blue-400 transition-colors"
											>
												@{creatorTwitterHandle}
											</a>
										) : (
											<a
												href={`http://suivision.xyz/account/${creatorWallet}?tab=Activity`}
												target="_blank"
												className="hover:underline"
											>
											<span className="font-medium text-foreground">
												{resolvedDomain || formatAddress(creatorWallet || "")}
											</span>
											</a>
										)}
									</div>
								)}
								
								{creatorLoading && (
									<div className="flex items-center gap-1 text-xs">
										<span className="text-muted-foreground">Loading creator...</span>
									</div>
								)}
							</div>

							<div className="flex items-center justify-between select-none">
								<div className="flex items-center gap-2">
									<h1 className="text-base font-bold text-foreground">
										{metadata?.name || "[UNNAMED]"}
									</h1>
									<span className="text-sm font-bold text-muted-foreground">
										{metadata?.symbol || "???"}
									</span>
								</div>

								{/* Social icons */}
								<div className="flex items-center gap-1">
									{pool.metadata?.X && (
										<div className="group cursor-pointer rounded-full p-0.5">
											<a href={pool.metadata.X} target="_blank" rel="noopener noreferrer">
												<BsTwitterX className="h-3.5 w-3.5 text-muted-foreground transition-all duration-200 hover:scale-110 hover:text-blue-400" />
											</a>
										</div>
									)}
									{pool.metadata?.Website && (
										<div className="group cursor-pointer rounded-full p-0.5">
											<a href={pool.metadata.Website} target="_blank" rel="noopener noreferrer">
												<Globe className="h-3.5 w-3.5 text-muted-foreground transition-all duration-200 hover:scale-110 hover:text-green-400" />
											</a>
										</div>
									)}
									{pool.metadata?.Telegram && (
										<div className="group cursor-pointer rounded-full p-0.5">
											<a href={pool.metadata.Telegram} target="_blank" rel="noopener noreferrer">
												<Send className="h-3.5 w-3.5 text-muted-foreground transition-all duration-200 hover:scale-110 hover:text-cyan-400" />
											</a>
										</div>
									)}
								</div>
							</div>

							<div className="relative select-none">
								<p className="text-[12px] text-muted-foreground line-clamp-2">
									{metadata?.description || "No description available"}
								</p>
							</div>

							{/* Creator Data Section */}
							{creatorLoading ? (
								<div className="flex items-center gap-3 text-xs select-none">
									<span className="text-muted-foreground">Loading creator data...</span>
								</div>
							) : currentCreatorData ? (
								<div className="flex items-center gap-3 text-xs select-none">
									<span className="text-muted-foreground">
										<span className="text-foreground font-medium">{currentCreatorData.launchCount}</span> launches
									</span>
									<span className="text-muted-foreground">
										<span className="text-foreground font-medium">{currentCreatorData.trustedFollowers}</span> trusted
									</span>
									<span className="text-muted-foreground">
										<span className="text-foreground font-medium">{currentCreatorData.followers}</span> followers
									</span>
								</div>
							) : null}
						</div>
					</div>
					
					{/* Protection badges section */}
					{(pool.pool?.isProtected || protectionSettings || (typeof pool.pool?.burnTax === 'number' && pool.pool?.burnTax > 0)) && (
						<div className="px-2 pb-2">
							<ProtectionBadges 
								protectionSettings={protectionSettings}
								isProtected={pool.pool?.isProtected}
								size="md"
								burnTax={pool.pool?.burnTax}
							/>
						</div>
					)}
				</div>

				{/* Market Data */}
				<div className="relative flex flex-col">
					<div className="grid grid-cols-4 border-t border-b border-border text-center select-none">
						<div className="flex h-full flex-col justify-center border-r border-border py-2">
							<div className="text-xs font-medium">
								<RelativeAge
									timestamp={pool.createdAt || Date.now()}
									className="text-xs"
								/>
							</div>
							<div className="text-xs text-muted-foreground">age</div>
						</div>

						<div className="flex h-full flex-col justify-center border-r border-border py-2">
							<div className="text-xs font-medium">
								${formatSmallPrice(currentPrice || 0)}
							</div>
							<div className="text-xs text-muted-foreground">price</div>
						</div>

						<div className="flex h-full flex-col justify-center border-r border-border py-2">
							<div className="text-xs font-medium">${formatNumberWithSuffix(currentMarketCap)}</div>
							<div className="text-xs text-muted-foreground">mcap</div>
						</div>

						<div className="flex h-full flex-col justify-center py-2">
							<div className="text-xs font-medium">${formatNumberWithSuffix(volume24h)}</div>
							<div className="text-xs text-muted-foreground">volume</div>
						</div>
					</div>

					<div className="relative">
						<div className="grid grid-cols-4 overflow-hidden border-b border-border text-center">
							<div className="relative flex cursor-pointer flex-col justify-center overflow-hidden border-r border-border py-2">
								<div className={cn(
									"text-xs group relative z-10 flex items-center justify-center font-bold",
									priceChange5m === null ? "text-muted-foreground" : priceChange5m > 0 ? "text-green-400" : "text-red-400"
								)}>
									<span className="transition-colors group-hover:text-white">
										{priceChange5m !== null ? `${priceChange5m > 0 ? '+' : ''}${priceChange5m.toFixed(2)}%` : '0.00%'}
									</span>
								</div>
								<div className="relative z-10 text-xs text-muted-foreground">5m</div>
							</div>

							<div className="relative flex cursor-pointer flex-col justify-center overflow-hidden border-r border-border py-2">
								<div className={cn(
									"text-xs group relative z-10 flex items-center justify-center font-bold",
									priceChange1h === null ? "text-muted-foreground" : priceChange1h > 0 ? "text-green-400" : "text-red-400"
								)}>
									<span className="transition-colors group-hover:text-white">
										{priceChange1h !== null ? `${priceChange1h > 0 ? '+' : ''}${priceChange1h.toFixed(2)}%` : '0.00%'}
									</span>
								</div>
								<div className="relative z-10 text-xs text-muted-foreground">1h</div>
							</div>

							<div className="relative flex cursor-pointer flex-col justify-center overflow-hidden border-r border-border py-2">
								<div className={cn(
									"text-xs group relative z-10 flex items-center justify-center font-bold",
									priceChange4h === null ? "text-muted-foreground" : priceChange4h > 0 ? "text-green-400" : "text-red-400"
								)}>
									<span className="transition-colors group-hover:text-white">
										{priceChange4h !== null ? `${priceChange4h > 0 ? '+' : ''}${priceChange4h.toFixed(2)}%` : '0.00%'}
									</span>
								</div>
								<div className="relative z-10 text-xs text-muted-foreground">4h</div>
							</div>

							<div className="relative flex cursor-pointer flex-col justify-center overflow-hidden py-2">
								<div className={cn(
									"text-xs group relative z-10 flex items-center justify-center font-bold",
									priceChange24h === null ? "text-muted-foreground" : priceChange24h > 0 ? "text-green-400" : "text-red-400"
								)}>
									<span className="transition-colors group-hover:text-white">
										{priceChange24h !== null ? `${priceChange24h > 0 ? '+' : ''}${priceChange24h.toFixed(2)}%` : '0.00%'}
									</span>
								</div>
								<div className="relative z-10 text-xs text-muted-foreground">24h</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Update Metadata Dialog */}
			<UpdateMetadataDialog
				open={updateMetadataDialogOpen}
				onOpenChange={setUpdateMetadataDialogOpen}
				pool={pool}
			/>
		</>
	)
}