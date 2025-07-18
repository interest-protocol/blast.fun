'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, TrendingDown, Activity, Skull } from 'lucide-react'
import { formatNumber } from '@/utils/format'
import type { PoolWithMetadata } from '@/types/pool'
import { useQuery } from '@apollo/client'
import { GET_MARKET_TRADES } from '@/graphql/trades'

interface TokenChartProps {
    pool: PoolWithMetadata
}

interface Trade {
    time: string
    price: string
    volume: number
    kind: 'buy' | 'sell'
    quoteAmount: string
    coinAmount: string
}

export function TokenChart({ pool }: TokenChartProps) {
    const [chartType, setChartType] = useState<'price' | 'volume'>('price')

    const { data, loading } = useQuery<{
        marketTrades: {
            trades: Trade[]
            total: number
        }
    }>(GET_MARKET_TRADES, {
        variables: {
            coinType: pool.coinType,
            page: 1,
            pageSize: 100,
            sortBy: { field: 'time', direction: 'DESC' }
        },
        pollInterval: 30000, // Refresh every 30 seconds
    })

    // Calculate real price and volume data from trades
    const { currentPrice, priceChange24h, volume24h, marketCap } = useMemo(() => {
        if (!data?.marketTrades?.trades?.length || !pool) {
            return {
                currentPrice: 0,
                priceChange24h: 0,
                volume24h: 0,
                marketCap: 0
            }
        }

        const trades = data.marketTrades.trades
        const latestTrade = trades[0]
        
        // Current price from latest trade
        const currentPrice = latestTrade ? parseFloat(latestTrade.price) : 0
        
        // Calculate 24h volume
        const now = Date.now()
        const dayAgo = now - 24 * 60 * 60 * 1000
        const dayTrades = trades.filter(t => new Date(t.time).getTime() > dayAgo)
        const volume24h = dayTrades.reduce((sum, t) => sum + (parseFloat(t.quoteAmount) / 1e9), 0)
        
        // Calculate 24h price change
        const oldestDayTrade = dayTrades[dayTrades.length - 1]
        const oldPrice = oldestDayTrade ? parseFloat(oldestDayTrade.price) : currentPrice
        const priceChange24h = oldPrice > 0 ? ((currentPrice - oldPrice) / oldPrice) * 100 : 0
        
        // Calculate market cap
        const totalSupply = parseFloat(pool.coinBalance) / Math.pow(10, pool.coinMetadata?.decimals || 9)
        const marketCap = totalSupply * currentPrice
        
        return {
            currentPrice,
            priceChange24h,
            volume24h,
            marketCap
        }
    }, [data, pool])

    const isPositive = priceChange24h >= 0

    return (
        <Card className="border-2 bg-background/50 backdrop-blur-sm shadow-2xl overflow-hidden">
            <CardHeader className="pb-4 border-b">
                <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-mono uppercase tracking-wider">
                        CHART::ANALYSIS
                    </CardTitle>
                    <Tabs value={chartType} onValueChange={(v) => setChartType(v as 'price' | 'volume')}>
                        <TabsList className="bg-background/50">
                            <TabsTrigger value="price" className="font-mono text-xs uppercase">
                                PRICE
                            </TabsTrigger>
                            <TabsTrigger value="volume" className="font-mono text-xs uppercase">
                                VOLUME
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
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
                <div className="relative h-64 bg-background/30">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <div className="animate-pulse">
                                    <Activity className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
                                </div>
                                <p className="font-mono text-sm uppercase text-muted-foreground">
                                    LOADING::MARKET_DATA
                                </p>
                            </div>
                        </div>
                    ) : !data?.marketTrades?.trades?.length ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <Skull className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
                                <p className="font-mono text-sm uppercase text-muted-foreground">
                                    NO::TRADE_DATA
                                </p>
                                <p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">
                                    AWAITING::MARKET_ACTIVITY
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <Activity className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
                                <p className="font-mono text-sm uppercase text-muted-foreground">
                                    CHART::COMING_SOON
                                </p>
                                <p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">
                                    TRADES::ACTIVE::{data.marketTrades.total}
                                </p>
                            </div>
                        </div>
                    )}
                    
                    {/* Decorative grid lines */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="h-full w-full" style={{
                            backgroundImage: `
                                repeating-linear-gradient(0deg, transparent, transparent 39px, currentColor 39px, currentColor 40px),
                                repeating-linear-gradient(90deg, transparent, transparent 39px, currentColor 39px, currentColor 40px)
                            `
                        }} />
                    </div>
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