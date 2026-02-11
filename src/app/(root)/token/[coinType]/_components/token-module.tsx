"use client"

import { useState, useEffect } from "react"
import tokenPriceSocket from "@/lib/websocket/token-price"
import type { Token } from "@/types/token"
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
import { TOTAL_POOL_SUPPLY, DEFAULT_TOKEN_DECIMALS } from "@/constants"
import { formatNumberWithSuffix } from "@/utils/format"
import { useTokenTabs } from "@/stores/token-tabs"
import { TwitterRelationsProvider } from "../_context/twitter-relations.context"

interface TokenModuleProps {
	pool: Token
	referral?: string
}

export function TokenModule({ pool, referral }: TokenModuleProps) {
	const [price, setPrice] = useState<number | null>(pool.market?.price || null)
	const [marketCap, setMarketCap] = useState<number | null>(pool.market?.marketCap || null)
	const { addTab } = useTokenTabs()

	// @dev: add this token tab to our registry (use poolId or coinType for Noodles-only tokens).
	useEffect(() => {
		if ((pool.pool?.poolId || pool.coinType) && pool.metadata) {
			addTab({
				poolId: pool.pool?.poolId || "",
				name: pool.metadata?.name || "Unknown",
				symbol: pool.metadata?.symbol || "???",
				iconUrl: pool.metadata?.icon_url,
				bondingCurve: pool.market?.bondingProgress || 0,
				coinType: pool.coinType,
			})
		}
	}, [pool.pool?.poolId, pool.metadata, pool.market?.bondingProgress, pool.coinType, addTab])

	useEffect(() => {
		const coinType = pool.coinType
		if (!coinType) return

		tokenPriceSocket.subscribeToTokenPrice(coinType, (data: { price: number }) => {
			setPrice(data.price)
			const decimals = pool.metadata?.decimals || DEFAULT_TOKEN_DECIMALS
			const totalSupply = Number(TOTAL_POOL_SUPPLY) / Math.pow(10, decimals)
			setMarketCap(data.price * totalSupply)
		})

		return () => {
			tokenPriceSocket.unsubscribeFromTokenPrice(coinType)
		}
	}, [pool.coinType, pool.metadata?.decimals])

	// @dev: Update document title when market cap changes
	useEffect(() => {
		if (marketCap !== null) {
			const symbol = pool.metadata?.symbol || "UNKNOWN"
			const formattedMcap = formatNumberWithSuffix(marketCap)
			document.title = `${symbol} $${formattedMcap} | BLAST.FUN`
		}
	}, [marketCap, pool.metadata?.symbol])

	return (
		<TwitterRelationsProvider pool={pool}>
			{/* Mobile View - shown only on mobile screens */}
			<MobileTokenView
				pool={pool}
				referral={referral}
				realtimePrice={price}
				realtimeMarketCap={marketCap}
			/>

			{/* Desktop View - shown only on desktop screens */}
			<div className="w-full h-full hidden lg:flex">
				<div className="flex-1 flex flex-col">
					{/* Chart and Tabs */}
					<ResizablePanelGroup
						direction="vertical"
						className="flex-1"
					>
						<ResizablePanel defaultSize={60} minSize={30}>
							<NexaChart coinType={pool.coinType} />
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

					{!pool.pool?.migrated && (
						<BondingProgress pool={pool} />
					)}

					<TradeTerminal pool={pool} referral={referral} />
					<HolderDetails pool={pool} />
					<ReferralShare pool={pool} />
				</div>
			</div>
		</TwitterRelationsProvider>
	)
}