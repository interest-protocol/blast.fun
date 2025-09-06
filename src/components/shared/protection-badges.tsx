"use client"

import { Eye, Flame, Percent, ShieldCheck, UserCheck } from "lucide-react"
import { BsTwitterX } from "react-icons/bs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { TokenProtectionSettings } from "@/hooks/use-token-protection"

interface ProtectionBadgesProps {
	protectionSettings?: TokenProtectionSettings | null
	isProtected?: boolean
	size?: "sm" | "md" | "lg"
	burnTax?: number
}

export function ProtectionBadges({ protectionSettings, isProtected, size = "sm", burnTax }: ProtectionBadgesProps) {
	if (!protectionSettings && !isProtected && (burnTax === undefined || burnTax === null || burnTax <= 0)) return null

	const iconSize = size === "sm" ? "w-3 h-3" : size === "md" ? "w-3.5 h-3.5" : "w-4 h-4"
	const padding = size === "sm" ? "p-0.5" : size === "md" ? "p-1" : "p-1.5"

	return (
		<div className="flex items-center gap-1.5">
			{(protectionSettings?.sniperProtection || isProtected) && (
				<Tooltip>
					<TooltipTrigger asChild>
						<div className={`flex items-center justify-center rounded-md bg-green-500/20 ${padding}`}>
							<ShieldCheck className={`${iconSize} text-green-500`} />
						</div>
					</TooltipTrigger>
					<TooltipContent className="border border-border bg-background">
						<div className="space-y-1 font-mono text-xs">
							<p className="font-bold text-green-400 uppercase">SNIPER::PROTECTED</p>
							<p className="text-muted-foreground">Anti-bot protections active</p>
						</div>
					</TooltipContent>
				</Tooltip>
			)}

			{protectionSettings?.requireTwitter && (
				<Tooltip>
					<TooltipTrigger asChild>
						<div className={`flex items-center justify-center rounded-md bg-muted-foreground/10 ${padding}`}>
							<BsTwitterX className={`${iconSize} text-muted-foreground`} />
						</div>
					</TooltipTrigger>
					<TooltipContent className="border border-border bg-background">
						<div className="space-y-1 font-mono text-xs">
							<p className="font-bold text-blue-400 uppercase">X::REQUIRED</p>
							<p className="text-muted-foreground">Must connect X account</p>
						</div>
					</TooltipContent>
				</Tooltip>
			)}

			{protectionSettings?.minFollowerCount && Number(protectionSettings.minFollowerCount) > 0 && (
				<Tooltip>
					<TooltipTrigger asChild>
						<div className={`flex items-center justify-center rounded-md bg-purple-500/20 ${padding}`}>
							<UserCheck className={`${iconSize} text-purple-400`} />
						</div>
					</TooltipTrigger>
					<TooltipContent className="border border-border bg-background">
						<div className="space-y-1 font-mono text-xs">
							<p className="font-bold text-purple-400 uppercase">FOLLOWER::MIN</p>
							<p className="text-muted-foreground">{protectionSettings.minFollowerCount}+ followers</p>
						</div>
					</TooltipContent>
				</Tooltip>
			)}

			{protectionSettings?.maxHoldingPercent && Number(protectionSettings.maxHoldingPercent) > 0 && (
				<Tooltip>
					<TooltipTrigger asChild>
						<div className={`flex items-center justify-center rounded-md bg-orange-500/20 ${padding}`}>
							<Percent className={`${iconSize} text-orange-400`} />
						</div>
					</TooltipTrigger>
					<TooltipContent className="border border-border bg-background">
						<div className="space-y-1 font-mono text-xs">
							<p className="font-bold text-orange-400 uppercase">MAX::HOLDING</p>
							<p className="text-muted-foreground">Max {protectionSettings.maxHoldingPercent}% per wallet</p>
						</div>
					</TooltipContent>
				</Tooltip>
			)}

			{protectionSettings?.revealTraderIdentity && (
				<Tooltip>
					<TooltipTrigger asChild>
						<div className={`flex items-center justify-center rounded-md bg-cyan-500/20 ${padding}`}>
							<Eye className={`${iconSize} text-cyan-400`} />
						</div>
					</TooltipTrigger>
					<TooltipContent className="border border-border bg-background">
						<div className="space-y-1 font-mono text-xs">
							<p className="font-bold text-cyan-400 uppercase">IDENTITY::VISIBLE</p>
							<p className="text-muted-foreground">X usernames shown</p>
						</div>
					</TooltipContent>
				</Tooltip>
			)}

			{burnTax !== undefined && burnTax > 0 && (
				<Tooltip>
					<TooltipTrigger asChild>
						<div className={`flex items-center justify-center rounded-md bg-orange-500/20 ${padding}`}>
							<Flame className={`${iconSize} text-orange-500`} />
						</div>
					</TooltipTrigger>
					<TooltipContent className="border border-border bg-background">
						<div className="space-y-1 font-mono text-xs">
							<p className="font-bold text-orange-500 uppercase">BURN::TAX</p>
							<p className="text-muted-foreground">
								Increases as bonding curve progresses, max {(burnTax / 100).toFixed(1)}%
							</p>
						</div>
					</TooltipContent>
				</Tooltip>
			)}
		</div>
	)
}
