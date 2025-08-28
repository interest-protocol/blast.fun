"use client"

import { ShieldCheck, Eye, UserCheck, Percent } from "lucide-react"
import { BsTwitterX } from "react-icons/bs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { TokenProtectionSettings } from "@/hooks/use-token-protection"

interface ProtectionBadgesProps {
	protectionSettings?: TokenProtectionSettings | null
	isProtected?: boolean
	size?: "sm" | "md" | "lg"
}

export function ProtectionBadges({ 
	protectionSettings, 
	isProtected,
	size = "sm" 
}: ProtectionBadgesProps) {
	if (!protectionSettings && !isProtected) return null

	const iconSize = size === "sm" ? "w-3 h-3" : size === "md" ? "w-3.5 h-3.5" : "w-4 h-4"
	const padding = size === "sm" ? "p-0.5" : size === "md" ? "p-1" : "p-1.5"

	return (
		<div className="flex items-center gap-1.5">
			{(protectionSettings?.sniperProtection || isProtected) && (
				<Tooltip>
					<TooltipTrigger asChild>
						<div className={`rounded-md flex items-center justify-center bg-green-500/20 ${padding}`}>
							<ShieldCheck className={`${iconSize} text-green-500`} />
						</div>
					</TooltipTrigger>
					<TooltipContent className="bg-background border border-border">
						<div className="text-xs font-mono space-y-1">
							<p className="font-bold uppercase text-green-400">SNIPER::PROTECTED</p>
							<p className="text-muted-foreground">Anti-bot protections active</p>
						</div>
					</TooltipContent>
				</Tooltip>
			)}

			{protectionSettings?.requireTwitter && (
				<Tooltip>
					<TooltipTrigger asChild>
						<div className={`rounded-md flex items-center justify-center bg-muted-foreground/10 ${padding}`}>
							<BsTwitterX className={`${iconSize} text-muted-foreground`} />
						</div>
					</TooltipTrigger>
					<TooltipContent className="bg-background border border-border">
						<div className="text-xs font-mono space-y-1">
							<p className="font-bold uppercase text-blue-400">X::REQUIRED</p>
							<p className="text-muted-foreground">Must connect X account</p>
						</div>
					</TooltipContent>
				</Tooltip>
			)}

			{protectionSettings?.minFollowerCount && Number(protectionSettings.minFollowerCount) > 0 && (
				<Tooltip>
					<TooltipTrigger asChild>
						<div className={`rounded-md flex items-center justify-center bg-purple-500/20 ${padding}`}>
							<UserCheck className={`${iconSize} text-purple-400`} />
						</div>
					</TooltipTrigger>
					<TooltipContent className="bg-background border border-border">
						<div className="text-xs font-mono space-y-1">
							<p className="font-bold uppercase text-purple-400">FOLLOWER::MIN</p>
							<p className="text-muted-foreground">{protectionSettings.minFollowerCount}+ followers</p>
						</div>
					</TooltipContent>
				</Tooltip>
			)}

			{protectionSettings?.maxHoldingPercent && Number(protectionSettings.maxHoldingPercent) > 0 && (
				<Tooltip>
					<TooltipTrigger asChild>
						<div className={`rounded-md flex items-center justify-center bg-orange-500/20 ${padding}`}>
							<Percent className={`${iconSize} text-orange-400`} />
						</div>
					</TooltipTrigger>
					<TooltipContent className="bg-background border border-border">
						<div className="text-xs font-mono space-y-1">
							<p className="font-bold uppercase text-orange-400">MAX::HOLDING</p>
							<p className="text-muted-foreground">Max {protectionSettings.maxHoldingPercent}% per wallet</p>
						</div>
					</TooltipContent>
				</Tooltip>
			)}

			{protectionSettings?.revealTraderIdentity && (
				<Tooltip>
					<TooltipTrigger asChild>
						<div className={`rounded-md flex items-center justify-center bg-cyan-500/20 ${padding}`}>
							<Eye className={`${iconSize} text-cyan-400`} />
						</div>
					</TooltipTrigger>
					<TooltipContent className="bg-background border border-border">
						<div className="text-xs font-mono space-y-1">
							<p className="font-bold uppercase text-cyan-400">IDENTITY::VISIBLE</p>
							<p className="text-muted-foreground">X usernames shown</p>
						</div>
					</TooltipContent>
				</Tooltip>
			)}
		</div>
	)
}