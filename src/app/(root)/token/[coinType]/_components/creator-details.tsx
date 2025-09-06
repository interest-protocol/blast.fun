"use client"

import { useResolveSuiNSName } from "@mysten/dapp-kit"
import { formatAddress } from "@mysten/sui/utils"
import { ExternalLink, Rocket, UserCheck, Users } from "lucide-react"
import { BsTwitterX } from "react-icons/bs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { Token } from "@/types/token"

interface CreatorDetailsProps {
	pool: Token
}

export function CreatorDetails({ pool }: CreatorDetailsProps) {
	const creatorTwitterHandle = pool.creator?.twitterHandle
	const creatorTwitterId = pool.creator?.twitterId
	const creatorWallet = pool.creator?.address
	const showTwitterCreator = !!creatorTwitterHandle
	const data = pool.creator

	const { data: resolvedDomain } = useResolveSuiNSName(!showTwitterCreator && creatorWallet ? creatorWallet : null)

	const displayName = showTwitterCreator
		? `@${creatorTwitterHandle}`
		: resolvedDomain
			? resolvedDomain
			: formatAddress(creatorWallet || "")

	const parseFormattedNumber = (str: string): number => {
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

	const getColorRgb = (count: number): string => {
		if (count >= 10000) return "6, 182, 212" // cyan-500
		if (count >= 5000) return "234, 179, 8" // yellow-500
		if (count >= 1000) return "168, 85, 247" // purple-500
		if (count >= 500) return "59, 130, 246" // blue-500
		if (count >= 100) return "34, 197, 94" // green-500
		return "100, 116, 139" // slate-500
	}

	return (
		<div className="border-border border-b">
			<div className="p-3">
				{/* Header */}
				<div className="mb-3 flex items-center justify-between">
					<div className="flex flex-col gap-0.5">
						<p className="font-medium font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
							Created by
						</p>
						<div className="flex items-center gap-1.5">
							<span className="font-bold font-mono text-foreground text-sm">{displayName}</span>
							{showTwitterCreator && (
								<a
									href={
										creatorTwitterId
											? `https://x.com/i/user/${creatorTwitterId}`
											: `https://x.com/${creatorTwitterHandle}`
									}
									target="_blank"
									rel="noopener noreferrer"
									className="text-muted-foreground transition-colors hover:text-foreground"
								>
									<BsTwitterX className="h-3.5 w-3.5" />
								</a>
							)}
							{creatorWallet && (
								<a
									href={`https://suiscan.xyz/mainnet/account/${creatorWallet}`}
									target="_blank"
									rel="noopener noreferrer"
									className="text-muted-foreground transition-colors hover:text-foreground"
								>
									<ExternalLink className="h-3.5 w-3.5" />
								</a>
							)}
						</div>
					</div>
				</div>

				{/* Stats Grid */}
				{data ? (
					<div className="flex gap-2">
						{/* Tokens Launched */}
						<div className="group relative flex-1">
							<div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 opacity-75 blur-sm transition-opacity group-hover:opacity-100" />
							<div className="relative rounded-lg border border-primary/20 bg-background/80 p-2.5 backdrop-blur-sm transition-colors hover:border-primary/40">
								<div className="mb-1 flex items-center justify-between">
									<Rocket className="h-3.5 w-3.5 text-primary" />
									<p className="font-bold font-mono text-foreground text-sm">{data.launchCount}</p>
								</div>
								<p className="font-medium font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
									Tokens
								</p>
							</div>
						</div>

						{/* Trusted Followers */}
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="group relative flex-1 cursor-help">
									{(() => {
										const trustedCount = parseFormattedNumber(data.trustedFollowers)
										const colorRgb = getColorRgb(trustedCount)

										return (
											<>
												<div
													className="absolute inset-0 rounded-lg opacity-75 blur-sm transition-opacity group-hover:opacity-100"
													style={{
														background: `linear-gradient(to bottom right, rgba(${colorRgb}, 0.15), rgba(${colorRgb}, 0.05))`,
													}}
												/>
												<div
													className="relative rounded-lg border bg-background/80 p-2.5 backdrop-blur-sm transition-all hover:border-opacity-60"
													style={{ borderColor: `rgba(${colorRgb}, 0.3)` }}
												>
													<div className="mb-1 flex items-center justify-between">
														<UserCheck
															className="h-3.5 w-3.5"
															style={{ color: `rgb(${colorRgb})` }}
														/>
														<p className="font-bold font-mono text-foreground text-sm">
															{data.trustedFollowers}
														</p>
													</div>
													<p className="font-medium font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
														Trusted
													</p>
												</div>
											</>
										)
									})()}
								</div>
							</TooltipTrigger>
							<TooltipContent className="max-w-[250px]">
								<p className="text-xs">Followers actively engaged in crypto and verified by the community</p>
							</TooltipContent>
						</Tooltip>

						{/* Total Followers */}
						<div className="group relative flex-1">
							<div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 opacity-75 blur-sm transition-opacity group-hover:opacity-100" />
							<div className="relative rounded-lg border border-blue-500/20 bg-background/80 p-2.5 backdrop-blur-sm transition-colors hover:border-blue-500/40">
								<div className="mb-1 flex items-center justify-between">
									<Users className="h-3.5 w-3.5 text-blue-500" />
									<p className="font-bold font-mono text-foreground text-sm">{data.followers}</p>
								</div>
								<p className="font-medium font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
									Followers
								</p>
							</div>
						</div>
					</div>
				) : (
					<div className="py-3 text-center">
						<p className="font-mono text-muted-foreground text-xs uppercase">DATA UNAVAILABLE</p>
					</div>
				)}
			</div>
		</div>
	)
}
