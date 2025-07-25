"use client"

import { PoolWithMetadata } from "@/types/pool"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Crosshair } from "lucide-react"

interface PositionsTabProps {
	pool: PoolWithMetadata
}

export function PositionsTab({ pool }: PositionsTabProps) {
	return (
		<ScrollArea className="h-[500px]">
			<div className="p-4">
				<div className="text-center py-16">
					<div className="relative inline-block">
						<Crosshair className="w-16 h-16 mx-auto text-foreground/20 mb-4" />
						<div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full animate-pulse" />
					</div>
					<p className="font-mono text-sm uppercase text-muted-foreground mb-2">
						POSITIONS::OFFLINE
					</p>
					<p className="font-mono text-xs uppercase text-muted-foreground/60">
						TRACKING_MODULE_INITIALIZING_FOR_{pool.coinMetadata?.symbol || "[TOKEN]"}
					</p>
				</div>
			</div>
		</ScrollArea>
	)
}