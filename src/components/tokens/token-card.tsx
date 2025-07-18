'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skull, Globe, Twitter } from 'lucide-react'
import type { PoolWithMetadata } from '@/types/pool'
import { formatAmountWithSuffix } from '@/utils/format'
import Link from 'next/link'
import { formatAddress } from '@mysten/sui/utils'

interface TokenCardProps {
  pool: PoolWithMetadata
}

export function TokenCard({ pool }: TokenCardProps) {
  const metadata = pool.metadata || {}
  const coinMetadata = pool.coinMetadata
  const marketCap = parseFloat(pool.quoteBalance) * 2 // Simplified calculation
  const bondingProgress = parseFloat(pool.bondingCurve)

  return (
    <Link href={`/pool/${pool.poolId}`}>
      <Card className="border-2 bg-background/50 backdrop-blur-sm shadow-2xl hover:shadow-primary/20 transition-all duration-300 group cursor-pointer">
        <CardHeader className="pb-4 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                {coinMetadata?.iconUrl ? (
                  <img
                    src={coinMetadata.iconUrl}
                    alt={coinMetadata.name || 'Token'}
                    className="relative w-12 h-12 rounded-lg object-cover border-2"
                  />
                ) : (
                  <div className="relative w-12 h-12 rounded-lg border-2 border-dashed bg-background/50 flex items-center justify-center">
                    <Skull className="w-6 h-6 text-foreground/20" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-mono text-sm uppercase tracking-wider">
                  {coinMetadata?.symbol || '[UNNAMED]'}
                </h3>
                <p className="font-mono text-xs uppercase text-muted-foreground">
                  {coinMetadata?.name || '[REDACTED]'}
                </p>
              </div>
            </div>
            {pool.nsfw && (
              <Badge variant="destructive" className="font-mono text-xs uppercase">
                NSFW::CONTENT
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="font-mono text-xs uppercase text-muted-foreground">
                MARKET::CAP
              </p>
              <p className="font-mono text-sm uppercase">
                ${formatAmountWithSuffix(marketCap)}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <p className="font-mono text-xs uppercase text-muted-foreground">
                CREATOR::ADDRESS
              </p>
              <p className="font-mono text-sm uppercase">
                {formatAddress(pool.creatorAddress)}

              </p>
            </div>

            <div className="flex justify-between items-center">
              <p className="font-mono text-xs uppercase text-muted-foreground">
                LIQUIDITY::POOL
              </p>
              <p className="font-mono text-sm uppercase">
                {formatAmountWithSuffix(pool.quoteBalance)} SUI
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center mb-2">
              <p className="font-mono text-xs uppercase text-muted-foreground">
                BONDING::PROGRESS
              </p>
              <p className="font-mono text-xs uppercase">
                {bondingProgress.toFixed(2)}%
              </p>
            </div>
            <Progress value={bondingProgress} className="h-2" />
          </div>

          <div className="pt-4 border-t">
            <p className="font-mono text-xs uppercase text-muted-foreground mb-2">
              DESCRIPTION::DATA
            </p>
            <p className="font-mono text-xs line-clamp-3 text-foreground/80">
              {coinMetadata?.description || 'NO::DESCRIPTION::AVAILABLE'}
            </p>
          </div>

          <div className="pt-4 border-t flex items-center gap-4">
            {metadata.twitter && (
              <a
                href={metadata.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {metadata.website && (
              <a
                href={metadata.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
            <p className="font-mono text-xs uppercase text-muted-foreground ml-auto">
              TOKEN::ID::{pool.poolId.slice(0, 8)}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}