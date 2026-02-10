"use client"

import { useState, useMemo } from "react"
import { useTheme } from "next-themes"
import { cn } from "@/utils"

interface NexaChartProps {
	coinType: string
	className?: string
}

/**
 * Token price chart. Uses Noodles TV Widget (supports any Sui coin_id);
 * works for both bonding-curve and Noodles-only tokens.
 */
export function NexaChart({ coinType, className }: NexaChartProps) {
	const [isLoading, setIsLoading] = useState(true)
	const [loadFailed, setLoadFailed] = useState(false)
	const { resolvedTheme } = useTheme()

	const chartUrl = useMemo(() => {
		const theme = resolvedTheme === "light" ? "light" : "dark"
		return `https://noodles.fi/tv-widget?coin=${encodeURIComponent(coinType)}&theme=${theme}`
	}, [coinType, resolvedTheme])

	return (
		<div className={cn("relative w-full h-full min-h-[200px]", className)}>
			{isLoading && !loadFailed && (
				<div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-xl z-10">
					<div className="text-center">
						<div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
						<p className="font-mono text-xs uppercase text-muted-foreground">LOADING::CHART</p>
					</div>
				</div>
			)}

			{loadFailed ? (
				<div className="absolute inset-0 flex items-center justify-center bg-muted/30 rounded-xl">
					<a
						href={chartUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="font-mono text-xs uppercase text-muted-foreground hover:text-foreground transition-colors"
					>
						OPEN CHART ON NOODLES.FI →
					</a>
				</div>
			) : (
				<iframe
					src={chartUrl}
					className={cn("w-full h-full min-h-[200px] border-0 rounded-xl", isLoading && "opacity-0")}
					title="Price chart"
					onLoad={() => setIsLoading(false)}
					onError={() => setLoadFailed(true)}
				/>
			)}
		</div>
	)
}