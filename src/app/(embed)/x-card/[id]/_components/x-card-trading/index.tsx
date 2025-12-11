"use client"

import { FC, useState } from "react"

import { XCardTradingProps } from "./x-card.types"
import { useMarketData } from "@/hooks/use-market-data"
import { NexaChart } from "@/components/shared/nexa-chart"
import { TradingPanel } from "../trading-panel"
import TopStats from "./_components/top-stats"
import FooterTabs from "./_components/footer-tabs"
import TokenInfo from "./_components/token-info"

const XCardTrading: FC<XCardTradingProps> = ({ pool, referrerWallet, refCode }) => {
    const [activeTab, setActiveTab] = useState<"trade" | "chart">("trade")
    const { data: marketData } = useMarketData(pool.coinType)

    const metadata = pool.metadata
    const bondingProgress = pool.market?.bondingProgress || 0
    const marketCap = marketData?.marketCap || 0
    const totalLiquidity = marketData?.liquidity || 0
    const holdersCount = marketData?.holdersCount || 0

    return (
        <div className="flex flex-col h-full bg-background">

            {activeTab === "trade" && (
                <TopStats
                    marketCap={marketCap}
                    liquidity={totalLiquidity}
                    bondingProgress={bondingProgress}
                    holdersCount={holdersCount}
                    isMarketDataLoaded={!!marketData}
                    quoteBalance={pool.pool?.quoteBalance || "0"}
                />
            )}

            <div className="flex-1 overflow-y-auto">
                {activeTab === "trade" ? (
                    <TradingPanel
                        pool={pool}
                        referrerWallet={referrerWallet}
                        refCode={refCode}
                    />
                ) : (
                    <NexaChart
                        coinType={pool.coinType}
                        className="w-full h-full"
                    />
                )}
            </div>

            <div className="border-t border-border p-3 space-y-3">
                <FooterTabs activeTab={activeTab} setActiveTab={setActiveTab} />

                <TokenInfo
                    metadata={metadata}
                    coinType={pool.coinType}
                    refCode={refCode!}
                />
            </div>
        </div>
    )
}

export default XCardTrading
