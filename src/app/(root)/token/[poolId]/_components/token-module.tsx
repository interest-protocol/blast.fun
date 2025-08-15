"use client"

import { useState, useEffect } from "react"
import tokenPriceSocket from "@/lib/websocket/token-price"
import type { PoolWithMetadata } from "@/types/pool"
import { TokenHeader } from "./token-header"
import { CreatorDetails } from "./creator-details"
import { NexaChart } from "@/components/shared/nexa-chart"
import {
	ResizablePanelGroup,
	ResizablePanel,
	ResizableHandle,
} from "@/components/ui/resizable"
import { useBreakpoint } from "@/hooks/use-breakpoint"

interface TokenModuleProps {
	pool: PoolWithMetadata
	referral?: string
}

export function TokenModule({ pool, referral }: TokenModuleProps) {
	const [price, setPrice] = useState<number | null>(pool.marketData?.coinPrice || null)
	const { isMobile } = useBreakpoint()

	useEffect(() => {
		const subscriptionId = pool.migrated && pool.mostLiquidPoolId
			? pool.mostLiquidPoolId
			: pool.innerState

		if (!subscriptionId) return

		tokenPriceSocket.subscribeToTokenPrice(
			subscriptionId,
			'direct',
			(data: any) => {
				setPrice(data.price * data.suiPrice)
			}
		)

		return () => {
			tokenPriceSocket.unsubscribeFromTokenPrice(subscriptionId, 'direct')
		}
	}, [pool.innerState, pool.mostLiquidPoolId, pool.migrated])

	// TODO: Add mobile view later
	if (isMobile) {
		return (
			<div className="w-full h-full flex flex-col">
				<TokenHeader pool={pool} realtimePrice={price} />
				<div className="flex-1 p-4">
					<p className="font-mono text-xs uppercase text-muted-foreground">
						Mobile view coming soon...
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className="w-full h-full flex">
			<div className="flex-1 flex flex-col">
				<TokenHeader pool={pool} realtimePrice={price} />

				{/* Chart and Tabs */}
				<ResizablePanelGroup
					direction="vertical"
					className="flex-1"
				>
					<ResizablePanel defaultSize={60} minSize={30}>
						<NexaChart pool={pool} />
					</ResizablePanel>

					<ResizableHandle withHandle />

					<ResizablePanel defaultSize={40} minSize={20}>
						{/* Token tabs will go here */}
						<div className="h-full p-4 overflow-auto">
							<pre className="text-xs">
								{JSON.stringify({
									poolId: pool.poolId,
									innerState: pool.innerState,
									realtimePrice: price,
									initialPrice: pool.marketData?.coinPrice,
									marketData: pool.marketData,
									creatorData: pool.creatorData
								}, null, 2)}
							</pre>
						</div>
					</ResizablePanel>
				</ResizablePanelGroup>
			</div>

			<div className="w-[400px] border-l flex flex-col h-full">
				<CreatorDetails pool={pool} />

				{/* TradeTerminal, BondingProgressBar, etc. will go here */}
				<div className="p-4">
					<p className="font-mono text-xs uppercase text-muted-foreground">
						Trade terminal coming soon...
					</p>
				</div>
			</div>
		</div>
	)
}