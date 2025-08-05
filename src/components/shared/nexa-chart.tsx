"use client"

import { PoolWithMetadata } from "@/types/pool"
import { useState } from "react"
import { cn } from "@/utils"

interface NexaChartProps {
	pool: PoolWithMetadata
	className?: string
}

export function NexaChart({ pool, className }: NexaChartProps) {
	const [isLoading, setIsLoading] = useState(true)
	const chartUrl = `https://app.nexa.xyz/xpump-tv-chart/${pool.coinType}`

	return (
		<div className={cn("relative w-full h-full", className)}>
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
				className={cn("w-full h-full rounded-xl border-0", isLoading && "opacity-0")}
				title="Nexa Trading Chart"
				allowFullScreen
				onLoad={() => setIsLoading(false)}
			/>
		</div>
	)
}