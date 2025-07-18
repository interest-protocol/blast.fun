'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ArrowUpRight, ArrowDownRight, RefreshCw, Skull } from 'lucide-react'
import { formatAmountWithSuffix } from '@/utils/format'
import { useQuery } from '@apollo/client'
import { GET_MARKET_TRADES } from '@/graphql/trades'
import type { PoolWithMetadata } from '@/types/pool'

interface TransactionHistoryProps {
    pool: PoolWithMetadata
}

interface Trade {
    time: string
    type: string
    price: string
    volume: number
    trader: string
    kind: 'buy' | 'sell'
    quoteAmount: string
    coinAmount: string
    digest: string
}

export function TransactionHistory({ pool }: TransactionHistoryProps) {
    const { data, loading, refetch } = useQuery<{
        marketTrades: {
            trades: Trade[]
            total: number
        }
    }>(GET_MARKET_TRADES, {
        variables: {
            coinType: pool.coinType,
            page: 1,
            pageSize: 20,
            sortBy: { field: 'time', direction: 'DESC' }
        },
        pollInterval: 30000, // Refresh every 30 seconds
    })

    const handleRefresh = () => {
        refetch()
    }

    const formatTime = (date: Date) => {
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const minutes = Math.floor(diff / 60000)

        if (minutes < 1) return 'JUST::NOW'
        if (minutes < 60) return `${minutes}M::AGO`
        if (minutes < 1440) return `${Math.floor(minutes / 60)}H::AGO`
        return `${Math.floor(minutes / 1440)}D::AGO`
    }

    return (
        <Card className="border-2 bg-background/50 backdrop-blur-sm shadow-2xl">
            <CardHeader className="pb-4 border-b">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-mono uppercase tracking-wider">
                        HISTORY::TRANSACTIONS
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRefresh}
                        className={loading ? 'animate-spin' : ''}
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {loading ? (
                    <div className="py-12 text-center">
                        <div className="animate-pulse">
                            <RefreshCw className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
                        </div>
                        <p className="font-mono text-sm uppercase text-muted-foreground">
                            LOADING::TRANSACTIONS
                        </p>
                    </div>
                ) : !data?.marketTrades?.trades?.length ? (
                    <div className="py-12 text-center">
                        <Skull className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
                        <p className="font-mono text-sm uppercase text-muted-foreground">
                            NO::TRANSACTIONS
                        </p>
                        <p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">
                            AWAITING::TRADING_ACTIVITY
                        </p>
                    </div>
                ) : (
                    <ScrollArea className="h-[400px]">
                        <div className="divide-y">
                            {data.marketTrades.trades.map((tx) => {
                                const decimals = pool.coinMetadata?.decimals || 9
                                const coinAmount = parseFloat(tx.coinAmount) / Math.pow(10, decimals)
                                const suiAmount = parseFloat(tx.quoteAmount) / 1e9
                                const timestamp = new Date(tx.time)

                                return (
                                    <div
                                        key={tx.digest}
                                        className="p-4 hover:bg-background/30 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${tx.kind === 'buy'
                                                    ? 'bg-green-500/10 text-green-500'
                                                    : 'bg-red-500/10 text-red-500'
                                                    }`}>
                                                    {tx.kind === 'buy' ? (
                                                        <ArrowUpRight className="w-4 h-4" />
                                                    ) : (
                                                        <ArrowDownRight className="w-4 h-4" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-mono text-sm uppercase">
                                                            {tx.kind}
                                                        </p>
                                                        <Badge
                                                            variant="outline"
                                                            className="font-mono text-xs uppercase"
                                                        >
                                                            {formatTime(timestamp)}
                                                        </Badge>
                                                    </div>
                                                    <p className="font-mono text-xs text-muted-foreground mt-1">
                                                        WALLET::{tx.trader.slice(0, 6)}...{tx.trader.slice(-4)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-mono text-sm">
                                                    {formatAmountWithSuffix(suiAmount)} SUI
                                                </p>
                                                <p className="font-mono text-xs text-muted-foreground">
                                                    {formatAmountWithSuffix(coinAmount)} @ ${formatAmountWithSuffix(parseFloat(tx.price))}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    )
}