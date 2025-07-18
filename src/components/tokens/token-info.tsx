'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink, Info } from 'lucide-react'
import type { PoolWithMetadata } from '@/types/pool'
import { formatNumber } from '@/utils/format'

interface TokenInfoProps {
    pool: PoolWithMetadata
}

export function TokenInfo({ pool }: TokenInfoProps) {
    const createdDate = new Date(pool.createdAt)
    const isValidDate = !isNaN(createdDate.getTime())

    return (
        <Card className="border-2 bg-background/50 backdrop-blur-sm shadow-2xl">
            <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg font-mono uppercase tracking-wider flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    POOL::INFO
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
                {/* Pool Details */}
                <div className="space-y-3">
                    <div>
                        <p className="font-mono text-xs uppercase text-muted-foreground">
                            BONDING::CURVE
                        </p>
                        <p className="font-mono text-sm">
                            {typeof pool.bondingCurve === 'number' 
                                ? pool.bondingCurve.toFixed(2) 
                                : parseFloat(pool.bondingCurve || '0').toFixed(2)}%
                        </p>
                    </div>

                    <div>
                        <p className="font-mono text-xs uppercase text-muted-foreground">
                            LIQUIDITY::SUI
                        </p>
                        <p className="font-mono text-sm">
                            {formatNumber(Number(pool.quoteBalance) / 1e9, 4)} SUI
                        </p>
                    </div>

                    <div>
                        <p className="font-mono text-xs uppercase text-muted-foreground">
                            CREATED::DATE
                        </p>
                        <p className="font-mono text-sm">
                            {isValidDate ? createdDate.toLocaleDateString() : '[UNKNOWN]'}
                        </p>
                    </div>

                    <div>
                        <p className="font-mono text-xs uppercase text-muted-foreground">
                            CREATOR::ADDRESS
                        </p>
                        <Button
                            variant="link"
                            className="h-auto p-0 font-mono text-sm"
                            asChild
                        >
                            <a
                                href={`https://suiscan.xyz/mainnet/account/${pool.creatorAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {pool.creatorAddress.slice(0, 6)}...{pool.creatorAddress.slice(-4)}
                                <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Pool Metadata if available */}
                {pool.metadata && typeof pool.metadata === 'object' && (
                    <div className="pt-4 border-t">
                        <p className="font-mono text-xs uppercase text-muted-foreground mb-2">
                            METADATA::SOCIAL
                        </p>
                        <div className="space-y-2">
                            {pool.metadata.twitter && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full font-mono text-xs"
                                    asChild
                                >
                                    <a
                                        href={`https://twitter.com/${pool.metadata.twitter}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        TWITTER::@{pool.metadata.twitter}
                                        <ExternalLink className="w-3 h-3 ml-2" />
                                    </a>
                                </Button>
                            )}
                            {pool.metadata.telegram && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full font-mono text-xs"
                                    asChild
                                >
                                    <a
                                        href={pool.metadata.telegram}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        TELEGRAM::CHANNEL
                                        <ExternalLink className="w-3 h-3 ml-2" />
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}