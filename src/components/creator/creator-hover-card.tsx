"use client"

import { useResolveSuiNSName } from "@mysten/dapp-kit"
import { formatAddress } from "@mysten/sui/utils"
import { Rocket, UserCheck, Users } from "lucide-react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import type { TokenCreator } from "@/types/token"

interface CreatorHoverCardProps {
	twitterHandle?: string
	twitterId?: string
	walletAddress?: string
	children: React.ReactNode
	className?: string
	data?: TokenCreator
}

export function CreatorHoverCard({ twitterHandle, walletAddress, children, data }: CreatorHoverCardProps) {
	const { data: resolvedDomain } = useResolveSuiNSName(!twitterHandle && walletAddress ? walletAddress : null)

	const displayName = twitterHandle
		? `@${twitterHandle}`
		: resolvedDomain
			? resolvedDomain
			: formatAddress(walletAddress || "")

	return (
		<HoverCard>
			<HoverCardTrigger asChild>{children}</HoverCardTrigger>
			<HoverCardContent
				className="w-80 select-none border-2 border-border/40 bg-background/50 p-0 shadow-2xl backdrop-blur-sm"
				sideOffset={5}
			>
				<div className="p-4">
					{/* Header */}
					<div className="mb-4 flex items-center justify-between border-border/20 border-b-2 border-dashed pb-3">
						<div>
							<p className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
								CREATOR IDENTITY
							</p>
							<p className="mt-1 font-mono text-foreground/80 text-sm uppercase tracking-wider">
								{displayName}
							</p>
						</div>
					</div>

					{/* Stats Grid */}
					{data ? (
						<div className="flex gap-2">
							{/* Tokens Launched */}
							<div className="group relative flex-1">
								<div className="absolute inset-0 rounded bg-primary/20 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
								<div className="relative rounded border-2 border-border/20 border-dashed bg-background/50 p-2.5 backdrop-blur-sm transition-all duration-300 group-hover:border-primary/40">
									<Rocket className="mb-1 h-4 w-4 text-primary/80" />
									<p className="whitespace-nowrap font-bold font-mono text-foreground/80 text-sm">
										{data.launchCount}
									</p>
									<p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
										TOKENS
									</p>
								</div>
							</div>

							{/* Trusted Followers */}
							<Tooltip delayDuration={2000}>
								<TooltipTrigger asChild>
									<div className="group relative flex-1 cursor-help">
										{(() => {
											const parseFormattedNumber = (str: string): number => {
												// Handle banded values like "10K-25K", ">1M", "<100"
												if (str.includes("-")) {
													// For ranges, use the lower bound
													const parts = str.split("-")
													str = parts[0]
												} else if (str.startsWith(">") || str.startsWith("<")) {
													// For > or < indicators, extract the number
													str = str.substring(1)
												}

												const cleanStr = str.replace(/,/g, "")
												const match = cleanStr.match(/^(\d+\.?\d*)([KMB])?$/i)
												if (!match) return 0

												const num = parseFloat(match[1])
												const suffix = match[2]?.toUpperCase()

												switch (suffix) {
													case "K":
														return num * 1000
													case "M":
														return num * 1000000
													case "B":
														return num * 1000000000
													default:
														return num
												}
											}

											const trustedCount = parseFormattedNumber(data.trustedFollowers)

											const getColorRgb = (count: number): string => {
												if (count >= 10000) return "6, 182, 212" // cyan-500
												if (count >= 5000) return "234, 179, 8" // yellow-500
												if (count >= 1000) return "168, 85, 247" // purple-500
												if (count >= 500) return "59, 130, 246" // blue-500
												if (count >= 100) return "34, 197, 94" // green-500
												return "100, 116, 139" // slate-500
											}

											const colorRgb = getColorRgb(trustedCount)

											return (
												<>
													<div
														className="absolute inset-0 rounded opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100"
														style={{ backgroundColor: `rgba(${colorRgb}, 0.2)` }}
													/>
													<div
														className="relative rounded border-2 border-border/20 border-dashed bg-background/50 p-2.5 backdrop-blur-sm transition-all duration-300 hover:border-opacity-0"
														style={
															{
																"--tw-border-opacity": 1,
															} as React.CSSProperties
														}
														onMouseEnter={(e) => {
															e.currentTarget.style.borderColor = `rgba(${colorRgb}, 0.4)`
														}}
														onMouseLeave={(e) => {
															e.currentTarget.style.borderColor = ""
														}}
													>
														<UserCheck
															className="mb-1 h-4 w-4"
															style={{ color: `rgba(${colorRgb}, 0.8)` }}
														/>
														<p className="whitespace-nowrap font-bold font-mono text-foreground/80 text-sm">
															{data.trustedFollowers}
														</p>
														<p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
															TRUSTED
														</p>
													</div>
												</>
											)
										})()}
									</div>
								</TooltipTrigger>
								<TooltipContent className="max-w-[250px]">
									<p className="text-xs">
										Followers actively engaged in crypto and verified by the community
									</p>
								</TooltipContent>
							</Tooltip>

							{/* Total Followers */}
							<div className="group relative flex-1">
								<div className="absolute inset-0 rounded bg-blue-500/20 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
								<div className="relative rounded border-2 border-border/20 border-dashed bg-background/50 p-2.5 backdrop-blur-sm transition-all duration-300 group-hover:border-blue-500/40">
									<Users className="mb-1 h-4 w-4 text-blue-500/80" />
									<p className="whitespace-nowrap font-bold font-mono text-foreground/80 text-sm">
										{data.followers}
									</p>
									<p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
										FOLLOWERS
									</p>
								</div>
							</div>
						</div>
					) : (
						<div className="py-6 text-center">
							<p className="font-mono text-muted-foreground text-xs uppercase">DATA::UNAVAILABLE</p>
						</div>
					)}
				</div>
			</HoverCardContent>
		</HoverCard>
	)
}
