'use client'

import { Skull } from 'lucide-react'
import { usePoolWithMetadata } from '@/hooks/use-pool-with-metadata'
import { TokenHeader } from '@/components/tokens/token-header'
import { TokenChart } from '@/components/tokens/token-chart'
import { TradingPanel } from '@/components/tokens/trading-panel'
import { TokenStats } from '@/components/tokens/token-stats'
import { TokenInfo } from '@/components/tokens/token-info'
import { TransactionHistory } from '@/components/tokens/transaction-history'
import { Card, CardContent } from '@/components/ui/card'

export default function CoinPage({
    params
}: {
    params: Promise<{ id: string }>;
}) {
    const [poolId, setPoolId] = React.useState<string>('')
    
    React.useEffect(() => {
        params.then(p => setPoolId(p.id))
    }, [params])

    const { pool, loading, error } = usePoolWithMetadata(poolId, {
        skip: !poolId
    })

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="animate-pulse">
                        <div className="w-16 h-16 bg-primary/20 rounded-full blur-xl mx-auto mb-4" />
                        <p className="font-mono text-sm uppercase text-muted-foreground">
                            LOADING::POOL_DATA
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !pool) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="border-2 bg-background/50 backdrop-blur-sm shadow-2xl">
                    <CardContent className="py-12">
                        <div className="text-center">
                            <Skull className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
                            <p className="font-mono text-sm uppercase text-muted-foreground">
                                ERROR::POOL_NOT_FOUND
                            </p>
                            <p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">
                                POOL_ID::{poolId || '[UNKNOWN]'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Chart and Info */}
                <div className="lg:col-span-2 space-y-6">
                    <TokenHeader pool={pool} />
                    <TokenChart pool={pool} />
                    <TokenStats pool={pool} />
                    <TransactionHistory pool={pool} />
                </div>

                {/* Right Column - Trading Panel */}
                <div className="space-y-6">
                    <TradingPanel pool={pool} />
                    <TokenInfo pool={pool} />
                </div>
            </div>
        </div>
    )
}

import React from 'react'