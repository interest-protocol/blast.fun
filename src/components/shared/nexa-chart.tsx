"use client"

import { useState, useMemo } from "react"
import { useTheme } from "next-themes"
import { cn } from "@/utils"

interface NexaChartProps {
	coinType: string
	className?: string
}

export function NexaChart({ coinType, className }: NexaChartProps) {
	const [isLoading, setIsLoading] = useState(true)
	const [loadFailed, setLoadFailed] = useState(false)
	const { resolvedTheme } = useTheme()

	const chartUrl = useMemo(() => {
		const safeCoinType = coinType ?? ""
		const theme = resolvedTheme === "light" ? "light" : "dark"
		return `https://noodles.fi/tv-widget?coin=${encodeURIComponent(safeCoinType)}&theme=${theme}`
	}, [coinType, resolvedTheme])

	if (loadFailed) {
		return (
			<div
				className={cn(
					"relative w-full h-full min-h-[200px] flex flex-col items-center justify-center bg-muted/30 rounded-xl gap-2",
					className
				)}
			>
				<p className="font-mono text-xs uppercase text-muted-foreground">CHART UNAVAILABLE</p>
				<a
					href={chartUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="font-mono text-xs text-primary hover:underline"
				>
					View on Noodles →
				</a>
			</div>
		)
	}

	return (
		<div className={cn("relative w-full h-full min-h-[200px]", className)}>
			{isLoading && (
				<div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-xl z-10">
					<div className="text-center">
						<div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
						<p className="font-mono text-xs uppercase text-muted-foreground">LOADING::CHART</p>
					</div>
				</div>
			)}

			<iframe
				src={chartUrl}
				className={cn("w-full h-full min-h-[200px] border-0 rounded-xl", isLoading && "opacity-0")}
				title="Price chart"
				allowFullScreen
				onLoad={() => setIsLoading(false)}
				onError={() => setLoadFailed(true)}
			/>
		</div>
	)
}