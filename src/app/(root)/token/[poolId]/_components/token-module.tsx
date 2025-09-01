"use client"

import { useState, useEffect } from "react"
import tokenPriceSocket from "@/lib/websocket/token-price"
import type { PoolWithMetadata } from "@/types/pool"
import { TokenInfo } from "./token-info"
import { TokenTabs } from "./token-tabs"
import { TradeTerminal } from "./trade-terminal"
import { BondingProgress } from "./bonding-progress"
import { ReferralShare } from "./referral-share"
import { HolderDetails } from "./holder-details"
import MobileTokenView from "./mobile-token-view"
import { NexaChart } from "@/components/shared/nexa-chart"
import {
	ResizablePanelGroup,
	ResizablePanel,
	ResizableHandle,
} from "@/components/ui/resizable"
import { useBreakpoint } from "@/hooks/use-breakpoint"
import { TOTAL_POOL_SUPPLY, DEFAULT_TOKEN_DECIMALS } from "@/constants"
import { formatNumberWithSuffix } from "@/utils/format"
import { useTokenTabs } from "@/stores/token-tabs"

interface TokenModuleProps {
	pool: PoolWithMetadata
	referral?: string
}

export function TokenModule({ pool, referral }: TokenModuleProps) {
	const [price, setPrice] = useState<number | null>(pool.marketData?.coinPrice || null)
	const [marketCap, setMarketCap] = useState<number | null>(pool.marketData?.marketCap || null)
	const { isMobile } = useBreakpoint()
	const { addTab } = useTokenTabs()

	// @dev: add this token tab to our registry for quick switching.
	useEffect(() => {
		if (pool.poolId && pool.coinMetadata) {
			addTab({
				poolId: pool.poolId,
				name: pool.coinMetadata.name || pool.metadata?.name || "Unknown",
				symbol: pool.coinMetadata.symbol || pool.metadata?.symbol || "???",
				iconUrl: pool.coinMetadata.iconUrl || pool.metadata?.image_url,
				bondingCurve: parseFloat(String(pool.bondingCurve)) || 0,
				coinType: pool.coinType,
			})
		}
	}, [pool.poolId, pool.coinMetadata, pool.metadata, pool.bondingCurve, pool.coinType, addTab])

	useEffect(() => {
		const subscriptionId = pool.migrated && pool.mostLiquidPoolId
			? pool.mostLiquidPoolId
			: pool.innerState

		if (!subscriptionId) return

		tokenPriceSocket.subscribeToTokenPrice(
			subscriptionId,
			'direct',
			(data: { price: number; suiPrice: number }) => {
				const newPrice = data.price * data.suiPrice
				setPrice(newPrice)

				const decimals = pool.coinMetadata?.decimals || DEFAULT_TOKEN_DECIMALS
				const totalSupply = Number(TOTAL_POOL_SUPPLY) / Math.pow(10, decimals)
				const calculatedMarketCap = newPrice * totalSupply
				setMarketCap(calculatedMarketCap)
			}
		)

		return () => {
			tokenPriceSocket.unsubscribeFromTokenPrice(subscriptionId, 'direct')
		}
	}, [pool.innerState, pool.mostLiquidPoolId, pool.migrated, pool.coinMetadata?.decimals])

	// @dev: Update document title when market cap changes
	useEffect(() => {
		if (marketCap !== null) {
			const symbol = pool.coinMetadata?.symbol || pool.metadata?.symbol || "UNKNOWN"
			const formattedMcap = formatNumberWithSuffix(marketCap)
			document.title = `${symbol} $${formattedMcap} | BLAST.FUN`
		}
	}, [marketCap, pool.coinMetadata?.symbol, pool.metadata?.symbol])

	if (isMobile) {
		return (
			<MobileTokenView 
				pool={pool} 
				referral={referral} 
				realtimePrice={price}
				realtimeMarketCap={marketCap}
			/>
		)
	}

	return (
		<div className="w-full h-full flex">
			<div className="flex-1 flex flex-col">
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
						<TokenTabs pool={pool} className="h-full" />
					</ResizablePanel>
				</ResizablePanelGroup>
			</div>

			{/* Right-side column */}
			<div className="w-[400px] border-l flex flex-col h-full overflow-y-auto">
				<TokenInfo pool={pool} realtimePrice={price} realtimeMarketCap={marketCap} />

				{!pool.migrated && (
					<BondingProgress pool={pool} />
				)}

				<TradeTerminal pool={pool} referral={referral} />
				<HolderDetails pool={pool} />
				<ReferralShare pool={pool} />
			</div>
		</div>
	)
}