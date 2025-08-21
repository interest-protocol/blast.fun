"use client"

import { Shield, ShieldCheck, Eye, EyeOff, UserCheck, Percent, Twitter } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/utils"

interface IndicatorProps {
	isCard?: boolean
	className?: string
}

export function SniperProtectionIndicator({ isCard = false, className }: IndicatorProps) {
	const iconSize = isCard ? "w-3 h-3" : "w-4 h-4"
	const padding = isCard ? "p-0.5" : "p-1"
	
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<div className={cn(
					"rounded-md flex items-center justify-center bg-green-500/15",
					padding,
					className
				)}>
					<ShieldCheck className={cn(iconSize, "text-green-500")} />
				</div>
			</TooltipTrigger>
			<TooltipContent>
				<div className="text-xs font-mono space-y-1">
					<p className="font-bold uppercase text-green-400">SNIPER::PROTECTED</p>
					<p className="text-muted-foreground">Anti-bot protections active</p>
				</div>
			</TooltipContent>
		</Tooltip>
	)
}

export function TwitterRequiredIndicator({ isCard = false, className }: IndicatorProps) {
	const iconSize = isCard ? "w-3 h-3" : "w-4 h-4"
	const padding = isCard ? "p-0.5" : "p-1"
	
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<div className={cn(
					"rounded-md flex items-center justify-center bg-blue-500/15",
					padding,
					className
				)}>
					<Twitter className={cn(iconSize, "text-blue-500")} />
				</div>
			</TooltipTrigger>
			<TooltipContent>
				<div className="text-xs font-mono space-y-1">
					<p className="font-bold uppercase text-blue-400">X::REQUIRED</p>
					<p className="text-muted-foreground">Must connect X account to trade</p>
				</div>
			</TooltipContent>
		</Tooltip>
	)
}

export function MinFollowersIndicator({ count, isCard = false, className }: IndicatorProps & { count: number | string }) {
	const iconSize = isCard ? "w-3 h-3" : "w-4 h-4"
	const padding = isCard ? "p-0.5" : "p-1"
	
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<div className={cn(
					"rounded-md flex items-center justify-center bg-purple-500/15",
					padding,
					className
				)}>
					<UserCheck className={cn(iconSize, "text-purple-500")} />
				</div>
			</TooltipTrigger>
			<TooltipContent>
				<div className="text-xs font-mono space-y-1">
					<p className="font-bold uppercase text-purple-400">FOLLOWER::MIN</p>
					<p className="text-muted-foreground">
						Requires {count}+ X followers
					</p>
				</div>
			</TooltipContent>
		</Tooltip>
	)
}

export function MaxHoldingIndicator({ percent, isCard = false, className }: IndicatorProps & { percent: number | string }) {
	const iconSize = isCard ? "w-3 h-3" : "w-4 h-4"
	const padding = isCard ? "p-0.5" : "p-1"
	
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<div className={cn(
					"rounded-md flex items-center justify-center bg-orange-500/15",
					padding,
					className
				)}>
					<Percent className={cn(iconSize, "text-orange-500")} />
				</div>
			</TooltipTrigger>
			<TooltipContent>
				<div className="text-xs font-mono space-y-1">
					<p className="font-bold uppercase text-orange-400">MAX::HOLDING</p>
					<p className="text-muted-foreground">
						Max {percent}% per wallet
					</p>
				</div>
			</TooltipContent>
		</Tooltip>
	)
}

export function RevealIdentityIndicator({ isCard = false, className }: IndicatorProps) {
	const iconSize = isCard ? "w-3 h-3" : "w-4 h-4"
	const padding = isCard ? "p-0.5" : "p-1"
	
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<div className={cn(
					"rounded-md flex items-center justify-center bg-cyan-500/15",
					padding,
					className
				)}>
					<Eye className={cn(iconSize, "text-cyan-500")} />
				</div>
			</TooltipTrigger>
			<TooltipContent>
				<div className="text-xs font-mono space-y-1">
					<p className="font-bold uppercase text-cyan-400">IDENTITY::VISIBLE</p>
					<p className="text-muted-foreground">X usernames shown in trades</p>
				</div>
			</TooltipContent>
		</Tooltip>
	)
}

export function HiddenCreatorIndicator({ isCard = false, className }: IndicatorProps) {
	const iconSize = isCard ? "w-3 h-3" : "w-4 h-4"
	const padding = isCard ? "p-0.5" : "p-1"
	
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<div className={cn(
					"rounded-md flex items-center justify-center bg-gray-500/15",
					padding,
					className
				)}>
					<EyeOff className={cn(iconSize, "text-gray-500")} />
				</div>
			</TooltipTrigger>
			<TooltipContent>
				<div className="text-xs font-mono space-y-1">
					<p className="font-bold uppercase text-gray-400">CREATOR::HIDDEN</p>
					<p className="text-muted-foreground">Creator identity redacted</p>
				</div>
			</TooltipContent>
		</Tooltip>
	)
}