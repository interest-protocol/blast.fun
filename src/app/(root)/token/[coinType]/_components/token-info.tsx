"use client"

import { useResolveSuiNSName } from "@mysten/dapp-kit"
import { formatAddress } from "@mysten/sui/utils"
import { Globe, Send } from "lucide-react"
import { useState } from "react"
import { BsTwitterX } from "react-icons/bs"
import { CopyableAddress } from "@/components/shared/copyable-address"
import { ProtectionBadges } from "@/components/shared/protection-badges"
import { RelativeAge } from "@/components/shared/relative-age"
import { TokenAvatar } from "@/components/tokens/token-avatar"
import { useApp } from "@/context/app.context"
import { useTokenProtection } from "@/hooks/use-token-protection"
import type { Token } from "@/types/token"
import { cn } from "@/utils"
import { formatNumberWithSuffix, formatSmallPrice } from "@/utils/format"
import { UpdateMetadataDialog } from "./update-metadata-dialog"

interface TokenInfoProps {
	pool: Token
	realtimePrice: number | null
	realtimeMarketCap?: number | null
}

export function TokenInfo({ pool, realtimePrice, realtimeMarketCap }: TokenInfoProps) {
	const [updateMetadataDialogOpen, setUpdateMetadataDialogOpen] = useState(false)
	const { isConnected, address } = useApp()
	const { settings: protectionSettings } = useTokenProtection(pool.pool?.poolId || "", pool.pool?.isProtected)

	const metadata = pool.metadata
	const marketData = pool.market
	const creatorData = pool.creator

	const creatorTwitterHandle = creatorData?.twitterHandle
	const creatorTwitterId = creatorData?.twitterId
	const creatorWallet = creatorData?.address
	const showTwitterCreator = !!creatorTwitterHandle

	const { data: resolvedDomain } = useResolveSuiNSName(!showTwitterCreator && creatorWallet ? creatorWallet : null)

	const priceChange5m =
		marketData?.price5MinsAgo && marketData?.price
			? ((marketData.price - marketData.price5MinsAgo) / marketData.price5MinsAgo) * 100
			: null

	const priceChange1h =
		marketData?.price1HrAgo && marketData?.price
			? ((marketData.price - marketData.price1HrAgo) / marketData.price1HrAgo) * 100
			: null

	const priceChange4h =
		marketData?.price4HrAgo && marketData?.price
			? ((marketData.price - marketData.price4HrAgo) / marketData.price4HrAgo) * 100
			: null

	const priceChange24h =
		marketData?.price1DayAgo && marketData?.price
			? ((marketData.price - marketData.price1DayAgo) / marketData.price1DayAgo) * 100
			: null

	const volume24h = marketData?.volume24h || 0
	const basePrice = marketData?.price || 0
	const baseMarketCap = marketData?.marketCap || 0

	const currentPrice = realtimePrice || basePrice
	const currentMarketCap = realtimeMarketCap || baseMarketCap

	// @dev: Check if current user is the token creator
	const isCreator = isConnected && address && creatorData?.address && address === creatorData?.address

	return (
		<>
			<div className="bg-background">
				<div>
					<div className="flex gap-2 p-2">
						<div className="flex-shrink-0">
							<TokenAvatar
								iconUrl={metadata?.icon_url || ""}
								symbol={metadata?.symbol}
								name={metadata?.name}
								className="h-20 w-20 rounded-md"
								fallbackClassName="text-2xl"
							/>
						</div>

						{/* Token Details */}
						<div className="flex min-w-0 flex-1 flex-col overflow-hidden">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-1.5">
									<div className="rounded bg-accent/50 px-1.5 py-0.5 hover:bg-accent/70">
										<CopyableAddress address={pool.coinType} showLabel={false} className="text-xs" />
									</div>

									{isCreator && (
										<button
											onClick={() => setUpdateMetadataDialogOpen(true)}
											className="rounded bg-accent/50 px-1.5 py-0.5 font-semibold text-muted-foreground text-xs uppercase transition-colors hover:bg-accent/70 hover:text-foreground/80"
										>
											Edit
										</button>
									)}
								</div>

								{(showTwitterCreator || creatorWallet) && (
									<div className="flex items-center gap-1 text-xs">
										<span className="text-muted-foreground">by</span>
										{showTwitterCreator ? (
											<a
												href={
													creatorTwitterId
														? `https://x.com/i/user/${creatorTwitterId}`
														: `https://x.com/${creatorTwitterHandle}`
												}
												target="_blank"
												rel="noopener noreferrer"
												className="font-medium text-foreground transition-colors hover:text-blue-400"
											>
												@{creatorTwitterHandle}
											</a>
										) : (
											<span className="font-medium text-foreground">
												{resolvedDomain || formatAddress(creatorWallet || "")}
											</span>
										)}
									</div>
								)}
							</div>

							<div className="flex select-none items-center justify-between">
								<div className="flex items-center gap-2">
									<h1 className="font-bold text-base text-foreground">{metadata?.name || "[UNNAMED]"}</h1>
									<span className="font-bold text-muted-foreground text-sm">
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
								<p className="line-clamp-2 text-[12px] text-muted-foreground">
									{metadata?.description || "No description available"}
								</p>
							</div>

							{creatorData && (
								<div className="flex select-none items-center gap-3 text-xs">
									<span className="text-muted-foreground">
										<span className="font-medium text-foreground">{creatorData.launchCount}</span>{" "}
										launches
									</span>
									<span className="text-muted-foreground">
										<span className="font-medium text-foreground">{creatorData.trustedFollowers}</span>{" "}
										trusted
									</span>
									<span className="text-muted-foreground">
										<span className="font-medium text-foreground">{creatorData.followers}</span>{" "}
										followers
									</span>
								</div>
							)}
						</div>
					</div>

					{/* Protection badges section */}
					{(pool.pool?.isProtected ||
						protectionSettings ||
						(typeof pool.pool?.burnTax === "number" && pool.pool?.burnTax > 0)) && (
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
					<div className="grid select-none grid-cols-4 border-border border-t border-b text-center">
						<div className="flex h-full flex-col justify-center border-border border-r py-2">
							<div className="font-medium text-xs">
								<RelativeAge timestamp={pool.createdAt || Date.now()} className="text-xs" />
							</div>
							<div className="text-muted-foreground text-xs">age</div>
						</div>

						<div className="flex h-full flex-col justify-center border-border border-r py-2">
							<div className="font-medium text-xs">${formatSmallPrice(currentPrice || 0)}</div>
							<div className="text-muted-foreground text-xs">price</div>
						</div>

						<div className="flex h-full flex-col justify-center border-border border-r py-2">
							<div className="font-medium text-xs">${formatNumberWithSuffix(currentMarketCap)}</div>
							<div className="text-muted-foreground text-xs">mcap</div>
						</div>

						<div className="flex h-full flex-col justify-center py-2">
							<div className="font-medium text-xs">${formatNumberWithSuffix(volume24h)}</div>
							<div className="text-muted-foreground text-xs">volume</div>
						</div>
					</div>

					<div className="relative">
						<div className="grid grid-cols-4 overflow-hidden border-border border-b text-center">
							<div className="relative flex cursor-pointer flex-col justify-center overflow-hidden border-border border-r py-2">
								<div
									className={cn(
										"group relative z-10 flex items-center justify-center font-bold text-xs",
										priceChange5m === null
											? "text-muted-foreground"
											: priceChange5m > 0
												? "text-green-400"
												: "text-red-400"
									)}
								>
									<span className="transition-colors group-hover:text-white">
										{priceChange5m !== null
											? `${priceChange5m > 0 ? "+" : ""}${priceChange5m.toFixed(2)}%`
											: "0.00%"}
									</span>
								</div>
								<div className="relative z-10 text-muted-foreground text-xs">5m</div>
							</div>

							<div className="relative flex cursor-pointer flex-col justify-center overflow-hidden border-border border-r py-2">
								<div
									className={cn(
										"group relative z-10 flex items-center justify-center font-bold text-xs",
										priceChange1h === null
											? "text-muted-foreground"
											: priceChange1h > 0
												? "text-green-400"
												: "text-red-400"
									)}
								>
									<span className="transition-colors group-hover:text-white">
										{priceChange1h !== null
											? `${priceChange1h > 0 ? "+" : ""}${priceChange1h.toFixed(2)}%`
											: "0.00%"}
									</span>
								</div>
								<div className="relative z-10 text-muted-foreground text-xs">1h</div>
							</div>

							<div className="relative flex cursor-pointer flex-col justify-center overflow-hidden border-border border-r py-2">
								<div
									className={cn(
										"group relative z-10 flex items-center justify-center font-bold text-xs",
										priceChange4h === null
											? "text-muted-foreground"
											: priceChange4h > 0
												? "text-green-400"
												: "text-red-400"
									)}
								>
									<span className="transition-colors group-hover:text-white">
										{priceChange4h !== null
											? `${priceChange4h > 0 ? "+" : ""}${priceChange4h.toFixed(2)}%`
											: "0.00%"}
									</span>
								</div>
								<div className="relative z-10 text-muted-foreground text-xs">4h</div>
							</div>

							<div className="relative flex cursor-pointer flex-col justify-center overflow-hidden py-2">
								<div
									className={cn(
										"group relative z-10 flex items-center justify-center font-bold text-xs",
										priceChange24h === null
											? "text-muted-foreground"
											: priceChange24h > 0
												? "text-green-400"
												: "text-red-400"
									)}
								>
									<span className="transition-colors group-hover:text-white">
										{priceChange24h !== null
											? `${priceChange24h > 0 ? "+" : ""}${priceChange24h.toFixed(2)}%`
											: "0.00%"}
									</span>
								</div>
								<div className="relative z-10 text-muted-foreground text-xs">24h</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Update Metadata Dialog */}
			<UpdateMetadataDialog open={updateMetadataDialogOpen} onOpenChange={setUpdateMetadataDialogOpen} pool={pool} />
		</>
	)
}
