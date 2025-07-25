"use client"

import { Skull } from "lucide-react"
import { SplashLoader } from "@/components/shared/splash-loader"
import { Card, CardContent } from "@/components/ui/card"
import { usePoolWithMetadata } from "@/hooks/pump/use-pool-with-metadata"
import { BondingProgress } from "./bonding-progress"
import { PoolHeader } from "./pool-header"
import { TradingTerminal } from "./trading-terminal"
import { PoolTabs } from "./pool-tabs"
import { CoinOHLCV } from "./coin-ohlcv"
import { ReferralShare } from "./referral-share"

export default function Pool({ poolId }: { poolId: string }) {
	const { data: pool, isLoading, error } = usePoolWithMetadata(poolId)

	if (isLoading) {
		return <SplashLoader />
	}

	if (error || !pool) {
		return (
			<div className="container mx-auto px-4 py-8">
				<Card className="border-2 bg-background/50 backdrop-blur-sm shadow-2xl">
					<CardContent className="py-12">
						<div className="text-center">
							<Skull className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
							<p className="font-mono text-sm uppercase text-muted-foreground">ERROR::POOL_NOT_FOUND</p>
							<p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">
								POOL_ID::{poolId || "[UNKNOWN]"}
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		)
	}

	return (
		<div className="space-y-4 sm:space-y-8">
			<div className="grid lg:grid-cols-3 gap-2 sm:gap-4 items-start">
				<div className="lg:col-span-2 order-2 lg:order-1">
					<div className="space-y-4">
						<PoolHeader pool={pool} />

						<div className="space-y-2 sm:space-y-4">
							<CoinOHLCV pool={pool} />
							<PoolTabs pool={pool} />
						</div>
					</div>
				</div>

				<div className="lg:col-span-1 space-y-2 sm:space-y-4 order-1 lg:order-2">
					<ReferralShare pool={pool} />
					<TradingTerminal pool={pool} />
					<BondingProgress pool={pool} />
				</div>
			</div>
		</div>
	)
}
