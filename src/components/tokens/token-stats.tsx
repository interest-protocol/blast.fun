"use client"

import { Users } from "lucide-react"
import { memo } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { formatNumberWithSuffix } from "@/utils/format"

interface TokenStatsProps {
	marketCap: number
	volume24h: number
	holdersCount: number
}

export const TokenStats = memo(function TokenStats({ marketCap, volume24h, holdersCount }: TokenStatsProps) {
	return (
		<div className="flex flex-wrap items-center gap-2 font-mono text-xs sm:gap-3">
			{marketCap > 0 && (
				<Tooltip>
					<TooltipTrigger asChild>
						<div className="flex items-center gap-1">
							<span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider sm:text-[10px]">
								MC
							</span>
							<span className="font-semibold text-[11px] text-green-500/90 sm:text-xs">
								${formatNumberWithSuffix(marketCap)}
							</span>
						</div>
					</TooltipTrigger>
					<TooltipContent>
						<p className="font-mono text-xs uppercase">MARKET CAP</p>
					</TooltipContent>
				</Tooltip>
			)}

			{volume24h > 0 && (
				<Tooltip>
					<TooltipTrigger asChild>
						<div className="flex items-center gap-1">
							<span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider sm:text-[10px]">
								VOL
							</span>
							<span className="font-semibold text-[11px] text-purple-500/90 sm:text-xs">
								${formatNumberWithSuffix(volume24h)}
							</span>
						</div>
					</TooltipTrigger>
					<TooltipContent>
						<p className="font-mono text-xs uppercase">24H VOLUME</p>
					</TooltipContent>
				</Tooltip>
			)}

			{holdersCount > 0 && (
				<Tooltip>
					<TooltipTrigger asChild>
						<div className="flex items-center gap-1">
							<Users className="h-3 w-3 text-muted-foreground/60" />
							<span className="font-semibold text-[11px] text-foreground/70 sm:text-xs">
								{formatNumberWithSuffix(holdersCount)}
							</span>
						</div>
					</TooltipTrigger>
					<TooltipContent>
						<p className="font-mono text-xs uppercase">HOLDERS</p>
					</TooltipContent>
				</Tooltip>
			)}
		</div>
	)
})
