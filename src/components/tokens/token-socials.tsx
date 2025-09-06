"use client"

import { Globe, Send } from "lucide-react"
import { memo } from "react"
import { BsTwitterX } from "react-icons/bs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface TokenSocialsProps {
	twitter?: string
	telegram?: string
	website?: string
}

export const TokenSocials = memo(function TokenSocials({ twitter, telegram, website }: TokenSocialsProps) {
	const socialLinks = [
		{ href: twitter, icon: BsTwitterX, tooltip: "X" },
		{ href: telegram, icon: Send, tooltip: "TELEGRAM" },
		{ href: website, icon: Globe, tooltip: "WEBSITE" },
	].filter((link) => link.href)

	if (socialLinks.length === 0) return null

	return (
		<>
			<span className="hidden text-muted-foreground/40 sm:inline">·</span>
			<div className="flex items-center gap-1">
				{socialLinks.map((link, index) => {
					const Icon = link.icon
					return (
						<Tooltip key={index}>
							<TooltipTrigger asChild>
								<button
									onClick={(e) => {
										e.stopPropagation()
										e.preventDefault()
										window.open(link.href, "_blank", "noopener,noreferrer")
									}}
									className="rounded-md p-0.5 text-muted-foreground/60 transition-all hover:bg-accent/20 hover:text-foreground/80"
								>
									<Icon className="size-3" />
								</button>
							</TooltipTrigger>
							<TooltipContent>
								<p className="font-mono text-xs uppercase">{link.tooltip}</p>
							</TooltipContent>
						</Tooltip>
					)
				})}
			</div>
		</>
	)
})
