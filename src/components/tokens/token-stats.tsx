'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatAmountWithSuffix } from '@/utils/format'
import type { PoolWithMetadata } from '@/types/pool'
import { Zap, Users, TrendingUp, Clock } from 'lucide-react'

interface TokenStatsProps {
    pool: PoolWithMetadata
}

export function TokenStats({ pool }: TokenStatsProps) {
    const metadata = pool.coinMetadata
    const decimals = metadata?.decimals || 9

    // Calculate bonding curve progress - parse bondingCurve from pool data
    const progress = typeof pool.bondingCurve === 'number'
        ? pool.bondingCurve
        : parseFloat(pool.bondingCurve) || 0
    const currentLiquidity = Number(pool.quoteBalance) / Math.pow(10, 9)
    const virtualLiquidity = Number(pool.virtualLiquidity) / Math.pow(10, 9)

    // Format dates
    const createdDate = new Date(pool.createdAt)
    const lastTradeDate = new Date(pool.lastTradeAt)
    const timeSinceCreation = isNaN(createdDate.getTime())
        ? 0
        : Math.floor((Date.now() - createdDate.getTime()) / 1000 / 60 / 60 / 24)

    const stats = [
        {
            label: 'LIQUIDITY::SUI',
            value: `${formatAmountWithSuffix(currentLiquidity, 2)}`,
            icon: <Zap className="w-4 h-4" />,
        },
        {
            label: 'SUPPLY::REMAINING',
            value: formatAmountWithSuffix(Number(pool.coinBalance) / Math.pow(10, decimals), 0),
            icon: <TrendingUp className="w-4 h-4" />,
        },
        {
            label: 'POOL::AGE',
            value: `${timeSinceCreation}d`,
            icon: <Clock className="w-4 h-4" />,
        },
        {
            label: 'LAST::TRADE',
            value: isNaN(lastTradeDate.getTime()) ? 'NEVER' : formatTimeAgo(lastTradeDate),
            icon: <Users className="w-4 h-4" />,
        },
    ]

    function formatTimeAgo(date: Date): string {
        const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
        if (seconds < 60) return `${seconds}s`
        const minutes = Math.floor(seconds / 60)
        if (minutes < 60) return `${minutes}m`
        const hours = Math.floor(minutes / 60)
        if (hours < 24) return `${hours}h`
        return `${Math.floor(hours / 24)}d`
    }

    return (
        <Card className="border-2 bg-background/50 backdrop-blur-sm shadow-2xl">
            <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg font-mono uppercase tracking-wider">
                    STATISTICS::POOL
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                {/* Bonding Curve Progress */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <p className="font-mono text-xs uppercase text-muted-foreground">
                            BONDING::CURVE_PROGRESS
                        </p>
                        <p className="font-mono text-xs uppercase">
                            {progress.toFixed(2)}%
                        </p>
                    </div>
                    <div className="relative">
                        <Progress value={progress} className="h-3" />
                        <div
                            className="absolute inset-0 bg-primary/20 blur-md"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between font-mono text-xs uppercase text-muted-foreground">
                        <span>0%</span>
                        <span>100%</span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="p-4 border rounded-lg bg-background/30"
                        >
                            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                {stat.icon}
                                <p className="font-mono text-xs uppercase">
                                    {stat.label}
                                </p>
                            </div>
                            <p className="font-mono text-lg">
                                {stat.value}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Pool Status */}
                <div className="pt-4 border-t space-y-3">
                    <p className="font-mono text-xs uppercase text-muted-foreground">
                        POOL::STATUS
                    </p>
                    <div className="space-y-2">
                        <div className="flex justify-between font-mono text-sm">
                            <span className="text-muted-foreground">CANONICAL</span>
                            <span className={pool.canonical ? 'text-green-500' : 'text-red-500'}>
                                {pool.canonical ? 'TRUE' : 'FALSE'}
                            </span>
                        </div>
                        <div className="flex justify-between font-mono text-sm">
                            <span className="text-muted-foreground">MIGRATED</span>
                            <span className={pool.migrated ? 'text-green-500' : 'text-red-500'}>
                                {pool.migrated ? 'TRUE' : 'FALSE'}
                            </span>
                        </div>
                        <div className="flex justify-between font-mono text-sm">
                            <span className="text-muted-foreground">CAN_MIGRATE</span>
                            <span className={pool.canMigrate ? 'text-green-500' : 'text-red-500'}>
                                {pool.canMigrate ? 'TRUE' : 'FALSE'}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}