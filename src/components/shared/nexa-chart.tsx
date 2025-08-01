"use client"

import { PoolWithMetadata } from "@/types/pool"

interface NexaChartProps {
	pool: PoolWithMetadata
	className?: string
}

export function NexaChart({ pool, className = "relative w-full h-[500px]" }: NexaChartProps) {
	const chartUrl = `https://app.nexa.xyz/trading-view-chart/${pool.coinType}`

	return (
		<div className={className}>
			<iframe
				src={chartUrl}
				className="w-full h-full rounded-xl border-0"
				title="Nexa Trading Chart"
				allowFullScreen
			/>
		</div>
	)
}