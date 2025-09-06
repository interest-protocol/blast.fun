"use client"

import { useState } from "react"
import { useApp } from "@/context/app.context"
import { Token } from "@/types/token"
import { cn } from "@/utils"

interface NexaChartProps {
	pool: Token
	className?: string
}

export function NexaChart({ pool, className }: NexaChartProps) {
	const [isLoading, setIsLoading] = useState(true)
	const { address } = useApp()
	const chartUrl = `https://app.nexa.xyz/xpump-tv-chart/${pool.coinType}?address=${address}`

	return (
		<div className={cn("relative h-full w-full", className)}>
			{isLoading && (
				<div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/50 backdrop-blur-sm">
					<div className="text-center">
						<div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
						<p className="font-mono text-muted-foreground text-xs uppercase">LOADING::CHART</p>
					</div>
				</div>
			)}

			<iframe
				src={chartUrl}
				className={cn("h-full w-full border-0", isLoading && "opacity-0")}
				title="Trade Chart"
				allowFullScreen
				onLoad={() => setIsLoading(false)}
			/>
		</div>
	)
}
