import { FC } from "react"

import { formatNumberWithSuffix } from "@/utils/format"
import { formatPrice } from "./mobile-market-stats.utils"
import TokenAvatar from "@/components/tokens/token-avatar"
import { RelativeAge } from "@/components/shared/relative-age"
import CopyableToken from "@/components/shared/copyable-token"
import { CreatorDisplay } from "@/components/creator/creator-display"
import { ProtectionBadges } from "@/components/shared/protection-badges"

import { MobileMarketStatsProps } from "./mobile-market-stats.types"

const MobileMarketStats: FC<MobileMarketStatsProps> = ({ pool }) => {
    const marketData = pool.market
    const coinMetadata = pool.metadata

    // Calculate 24h price change
    const currentPrice = marketData?.price || 0
    const price24hAgo = currentPrice // @dev: No historical price data available in new Token interface
    const priceChange24h = price24hAgo > 0 ? ((currentPrice - price24hAgo) / price24hAgo) * 100 : 0

    return (
        <div className="w-full border-b border-border">
            {/* Token Information Section */}
            <div className="p-3 border-b border-border/50">
                <div className="flex items-center gap-3">
                    <TokenAvatar
                        iconUrl={coinMetadata?.icon_url || undefined}
                        symbol={coinMetadata?.symbol}
                        name={coinMetadata?.name}
                        className="h-10 w-10 rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-mono font-bold text-sm uppercase tracking-wider text-foreground/90 truncate">
                                {coinMetadata?.name || "[UNNAMED]"}
                            </h3>
                            <ProtectionBadges
                                protectionSettings={undefined}
                                isProtected={pool.pool?.isProtected}
                                size="sm"
                                burnTax={pool.pool?.burnTax}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <CopyableToken
                                symbol={coinMetadata?.symbol || "[???]"}
                                coinType={pool.coinType}
                                className="text-xs"
                            />
                            <span className="text-muted-foreground/40">·</span>
                            <RelativeAge
                                timestamp={(() => {
                                    if (!pool.createdAt) return Date.now()
                                    const numericValue = Number(pool.createdAt)
                                    if (!isNaN(numericValue) && numericValue > 0) {
                                        return numericValue
                                    }
                                    const dateValue = new Date(pool.createdAt).getTime()
                                    return isNaN(dateValue) ? Date.now() : dateValue
                                })()}
                                className="text-muted-foreground/60 uppercase font-medium tracking-wide text-xs"
                            />
                            <span className="text-muted-foreground/40">·</span>
                            <span className="text-muted-foreground/60 uppercase tracking-wide text-xs">by</span>
                            <CreatorDisplay
                                walletAddress={pool.creator?.address}
                                twitterHandle={pool.creator?.twitterHandle || undefined}
                                twitterId={pool.creator?.twitterId || undefined}
                                className="text-foreground/70 text-xs"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Market Stats Section */}
            <div className="flex justify-between items-center">
                <div className="w-full flex flex-col items-center justify-center py-2 border-r border-border">
                    <p className="text-[10px] text-muted-foreground">Price</p>
                    <div className="text-xs flex items-baseline">
                        <span>$</span>
                        {(() => {
                            const formatted = formatPrice(currentPrice)
                            // Check if price has leading zeros after decimal
                            const match = formatted.match(/^0\.(0+)(.+)$/)
                            if (match) {
                                // match[1] is the leading zeros, match[2] is the significant part
                                const zeros = match[1]
                                const significant = match[2]
                                const zeroCount = zeros.length

                                return (
                                    <>
                                        <span>0.</span>
                                        <sub className="text-[8px] text-muted-foreground">{zeroCount}</sub>
                                        <span>{significant}</span>
                                    </>
                                )
                            }
                            // Regular price display
                            return <span>{formatted}</span>
                        })()}
                    </div>
                </div>
                <div className="w-full flex flex-col items-center justify-center py-2 border-r border-border">
                    <p className="text-[10px] text-muted-foreground">24h</p>
                    <p className={`text-xs ${priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
                    </p>
                </div>
                <div className="w-full flex flex-col items-center justify-center py-2 border-r border-border">
                    <p className="text-[10px] text-muted-foreground">Market Cap</p>
                    <p className="text-xs text-yellow-500">
                        ${formatNumberWithSuffix(marketData?.marketCap || 0)}
                    </p>
                </div>
                <div className="w-full flex flex-col items-center justify-center py-2">
                    <p className="text-[10px] text-muted-foreground">24h Vol</p>
                    <p className="text-xs text-purple-500">
                        ${formatNumberWithSuffix(marketData?.volume24h || 0)}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default MobileMarketStats;