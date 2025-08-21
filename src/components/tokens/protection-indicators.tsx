"use client"

import { Shield } from "lucide-react"
import { cn } from "@/utils"
import {
	SniperProtectionIndicator,
	TwitterRequiredIndicator,
	MinFollowersIndicator,
	MaxHoldingIndicator,
	RevealIdentityIndicator,
	HiddenCreatorIndicator
} from "./protection-indicator-items"

interface ProtectionSettings {
	sniperProtection?: boolean
	requireTwitter?: boolean
	revealTraderIdentity?: boolean
	minFollowerCount?: number | string
	maxHoldingPercent?: number | string
	hideCreatorIdentity?: boolean
}

interface ProtectionIndicatorsProps {
	settings: ProtectionSettings
	variant?: "card" | "page"
	className?: string
}

export function ProtectionIndicators({ settings, variant = "card", className }: ProtectionIndicatorsProps) {
	const isCard = variant === "card"
	const containerClass = isCard ? "gap-0.5" : "gap-3"
	
	// Check if any protection is active
	const hasProtections = settings.sniperProtection || 
		settings.requireTwitter || 
		settings.minFollowerCount || 
		settings.maxHoldingPercent ||
		settings.hideCreatorIdentity

	if (!hasProtections) return null

	return (
		<div className={cn("flex items-center justify-center flex-wrap", containerClass, className)}>
			{settings.sniperProtection && <SniperProtectionIndicator isCard={isCard} />}
			{settings.requireTwitter && <TwitterRequiredIndicator isCard={isCard} />}
			{settings.minFollowerCount && Number(settings.minFollowerCount) > 0 && (
				<MinFollowersIndicator count={settings.minFollowerCount} isCard={isCard} />
			)}
			{settings.maxHoldingPercent && Number(settings.maxHoldingPercent) > 0 && (
				<MaxHoldingIndicator percent={settings.maxHoldingPercent} isCard={isCard} />
			)}
			{settings.revealTraderIdentity && <RevealIdentityIndicator isCard={isCard} />}
			{settings.hideCreatorIdentity && <HiddenCreatorIndicator isCard={isCard} />}
		</div>
	)
}

interface ProtectionBannerProps {
	settings: ProtectionSettings
	className?: string
}

export function ProtectionBanner({ settings, className }: ProtectionBannerProps) {
	const protections: string[] = []
	
	if (settings.sniperProtection) {
		protections.push("SNIPER PROTECTED")
	}
	if (settings.requireTwitter) {
		protections.push("X LOGIN REQUIRED")
	}
	if (settings.minFollowerCount && Number(settings.minFollowerCount) > 0) {
		protections.push(`${settings.minFollowerCount}+ FOLLOWERS`)
	}
	if (settings.maxHoldingPercent && Number(settings.maxHoldingPercent) > 0) {
		protections.push(`MAX ${settings.maxHoldingPercent}% PER WALLET`)
	}
	if (settings.revealTraderIdentity) {
		protections.push("X IDENTITY VISIBLE")
	}

	if (protections.length === 0) return null

	return (
		<div className={cn(
			"flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg",
			className
		)}>
			<Shield className="w-4 h-4 text-green-500" />
			<div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
				{protections.map((protection, index) => (
					<span key={index} className="text-[10px] font-mono uppercase text-green-400 whitespace-nowrap">
						{protection}
						{index < protections.length - 1 && (
							<span className="text-muted-foreground/40 mx-1">•</span>
						)}
					</span>
				))}
			</div>
		</div>
	)
}