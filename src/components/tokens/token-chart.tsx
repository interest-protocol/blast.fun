'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, TrendingDown, Activity, Skull } from 'lucide-react'
import { formatNumber } from '@/utils/format'
import type { PoolWithMetadata } from '@/types/pool'
import { useSimpleChartData } from '@/hooks/use-simple-chart-data'
import { PriceChart } from './price-chart'

interface TokenChartProps {
    pool: PoolWithMetadata
}

export function TokenChart({ pool }: TokenChartProps) {
    const [chartType, setChartType] = useState<'price' | 'volume'>('price')
    const [timeframe, setTimeframe] = useState('1h')
    
    const { 
        ohlcv, 
        loading, 
        error, 
        latestPrice, 
        priceChange24h, 
        volume24h,
        refetch
    } = useSimpleChartData({
        poolId: pool.poolId,
        enabled: !!pool.poolId
    })

    const currentPrice = latestPrice || 0
    const isPositive = priceChange24h >= 0
    
    // Calculate market cap
    const marketCap = currentPrice * (parseFloat(pool.coinBalance) / Math.pow(10, pool.coinMetadata?.decimals || 9))

    return (
        <Card className="border-2 bg-background/50 backdrop-blur-sm shadow-2xl overflow-hidden">
            <CardHeader className="pb-4 border-b">
                <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-mono uppercase tracking-wider">
                        CHART::ANALYSIS
                    </CardTitle>
                    <div className="flex gap-2">
                        <Tabs value={timeframe} onValueChange={setTimeframe}>
                            <TabsList className="bg-background/50">
                                <TabsTrigger value="1h" className="font-mono text-xs uppercase px-2">
                                    1H
                                </TabsTrigger>
                                <TabsTrigger value="4h" className="font-mono text-xs uppercase px-2">
                                    4H
                                </TabsTrigger>
                                <TabsTrigger value="1d" className="font-mono text-xs uppercase px-2">
                                    1D
                                </TabsTrigger>
                                <TabsTrigger value="1w" className="font-mono text-xs uppercase px-2">
                                    1W
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {/* Price Display */}
                <div className="p-4 border-b">
                    {currentPrice > 0 ? (
                        <>
                            <div className="flex items-baseline gap-4">
                                <h2 className="text-2xl font-bold font-mono">
                                    ${formatNumber(currentPrice, 6)}
                                </h2>
                                <div className={`flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                    {isPositive ? (
                                        <TrendingUp className="w-4 h-4" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4" />
                                    )}
                                    <span className="font-mono text-sm">
                                        {isPositive ? '+' : ''}{priceChange24h.toFixed(2)}%
                                    </span>
                                </div>
                            </div>
                            <p className="font-mono text-xs uppercase text-muted-foreground mt-1">
                                PRICE::LATEST
                            </p>
                        </>
                    ) : (
                        <p className="font-mono text-sm uppercase text-muted-foreground">
                            PRICE::NO_DATA
                        </p>
                    )}
                </div>

                {/* Chart Display */}
                <div className="relative bg-background/30">
                    {loading ? (
                        <div className="h-80 flex items-center justify-center">
                            <div className="text-center">
                                <div className="animate-pulse">
                                    <Activity className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
                                </div>
                                <p className="font-mono text-sm uppercase text-muted-foreground">
                                    LOADING::CHART_DATA
                                </p>
                            </div>
                        </div>
                    ) : ohlcv.length > 0 ? (
                        <div className="p-4">
                            <PriceChart bars={ohlcv} />
                        </div>
                    ) : (
                        <div className="p-4">
                            <div className="h-48 bg-background/50 rounded-lg border-2 border-dashed border-border/50 flex items-center justify-center">
                                <div className="text-center">
                                    <Activity className="w-10 h-10 mx-auto text-foreground/20 mb-3" />
                                    <p className="font-mono text-sm uppercase text-muted-foreground">
                                        CHART::NO_TRADES
                                    </p>
                                    <p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">
                                        WAITING::FOR_ACTIVITY
                                    </p>
                                </div>
                            </div>
                            
                            {/* Show basic pool stats as fallback */}
                            <div className="mt-4 p-4 bg-background/30 rounded border">
                                <p className="font-mono text-xs uppercase text-muted-foreground mb-3">
                                    POOL::BASIC_INFO
                                </p>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="font-mono text-xs uppercase text-muted-foreground">SYMBOL</span>
                                        <span className="font-mono text-sm">{pool.coinMetadata?.symbol || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-mono text-xs uppercase text-muted-foreground">DECIMALS</span>
                                        <span className="font-mono text-sm">{pool.coinMetadata?.decimals || 9}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-mono text-xs uppercase text-muted-foreground">COIN::BALANCE</span>
                                        <span className="font-mono text-sm">
                                            {formatNumber(parseFloat(pool.coinBalance) / Math.pow(10, pool.coinMetadata?.decimals || 9))}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-mono text-xs uppercase text-muted-foreground">SUI::BALANCE</span>
                                        <span className="font-mono text-sm">
                                            {formatNumber(parseFloat(pool.balance) / Math.pow(10, 9))} SUI
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-px bg-border">
                    <div className="bg-background p-4">
                        <p className="font-mono text-xs uppercase text-muted-foreground">
                            VOLUME::24H
                        </p>
                        <p className="font-mono text-lg mt-1">
                            ${formatNumber(volume24h)}
                        </p>
                    </div>
                    <div className="bg-background p-4">
                        <p className="font-mono text-xs uppercase text-muted-foreground">
                            MARKET::CAP
                        </p>
                        <p className="font-mono text-lg mt-1">
                            ${formatNumber(marketCap)}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}