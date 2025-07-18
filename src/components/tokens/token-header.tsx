'use client'

import { Copy, ExternalLink } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { PoolWithMetadata } from '@/types/pool'
import { useClipboard } from '@/hooks/use-clipboard'

interface TokenHeaderProps {
    pool: PoolWithMetadata
}

export function TokenHeader({ pool }: TokenHeaderProps) {
    const { copy, copied } = useClipboard()
    const metadata = pool.coinMetadata

    return (
        <div className="bg-background/50 backdrop-blur-sm border rounded-lg p-4">
            <div className="flex items-center gap-3">
                {/* Compact Token Avatar */}
                <Avatar className="w-12 h-12 border">
                    <AvatarImage src={metadata?.iconUrl || ''} alt={metadata?.symbol} />
                    <AvatarFallback className="font-mono text-xs uppercase">
                        {metadata?.symbol?.slice(0, 2) || '??'}
                    </AvatarFallback>
                </Avatar>

                {/* Token Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h1 className="text-lg font-bold font-mono uppercase tracking-wider text-foreground/80 truncate">
                            {metadata?.name || '[UNNAMED]'}
                        </h1>
                        <span className="font-mono text-sm text-muted-foreground">
                            ${metadata?.symbol || '[???]'}
                        </span>
                        {pool.nsfw && (
                            <Badge variant="destructive" className="font-mono text-xs uppercase">
                                NSFW
                            </Badge>
                        )}
                        {pool.migrated && (
                            <Badge variant="secondary" className="font-mono text-xs uppercase">
                                MIGRATED
                            </Badge>
                        )}
                    </div>
                    
                    {/* Contract Address */}
                    <div className="flex items-center gap-1 mt-1">
                        <p className="font-mono text-xs text-muted-foreground">
                            {pool.coinType.slice(0, 6)}...{pool.coinType.slice(-4)}
                        </p>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => copy(pool.coinType)}
                        >
                            <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            asChild
                        >
                            <a 
                                href={`https://suiscan.xyz/mainnet/coin/${pool.coinType}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}