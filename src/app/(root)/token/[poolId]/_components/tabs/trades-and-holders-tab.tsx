"use client"

import { PoolWithMetadata } from "@/types/pool"
import { TradesTab } from "./trades-tab"
import { Users, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/utils"
import { CopyableAddress } from "@/components/shared/copyable-address"
import { formatAmountWithSuffix } from "@/utils/format"
import { Badge } from "@/components/ui/badge"
import { useTopHolders } from "@/hooks/use-top-holders"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TradesAndHoldersTabProps {
  pool: PoolWithMetadata
  className?: string
  isVisible?: boolean
}

export function TradesAndHoldersTab({ pool, className, isVisible = true }: TradesAndHoldersTabProps) {
  const { data: holdersData, isLoading, error } = useTopHolders(pool.coinType)
  const metadata = pool.coinMetadata
  const coinDecimals = metadata?.decimals || 9

  return (
    <div className={cn("flex flex-col lg:flex-row h-full gap-0 lg:gap-px bg-border", className)}>
      {/* Trades Section - Full width on mobile, 50% on desktop */}
      <div className="w-full lg:w-1/2 h-1/2 lg:h-full bg-background">
        <TradesTab pool={pool} className="h-full" isVisible={isVisible} />
      </div>

      {/* Holders Section - Full width on mobile, 50% on desktop */}
      <div className="w-full lg:w-1/2 h-1/2 lg:h-full bg-background">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="border-b p-3 flex items-center justify-between bg-background/95 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-mono text-xs uppercase tracking-wider">
                TOP 10 HOLDERS
              </h3>
            </div>
            {holdersData && (
              <div className="font-mono text-xs text-muted-foreground">
                Total: {formatAmountWithSuffix(holdersData.totalHoldings / Math.pow(10, coinDecimals))}
              </div>
            )}
          </div>

          {/* Content */}
          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="p-4 space-y-2">
                <div className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-muted-foreground" />
                  <p className="font-mono text-xs uppercase text-muted-foreground">
                    LOADING::HOLDERS
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="p-4">
                <div className="text-center py-8">
                  <AlertCircle className="h-6 w-6 mx-auto mb-2 text-destructive" />
                  <p className="font-mono text-xs uppercase text-destructive">
                    ERROR::LOADING::HOLDERS
                  </p>
                </div>
              </div>
            ) : holdersData?.holders.length === 0 ? (
              <div className="p-4">
                <div className="text-center py-8">
                  <Users className="h-6 w-6 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="font-mono text-xs uppercase text-muted-foreground">
                    NO::HOLDERS::FOUND
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-2">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 px-2 py-1.5 text-[10px] font-mono uppercase text-muted-foreground sticky top-0 bg-background/95 backdrop-blur-sm">
                  <div className="col-span-1">#</div>
                  <div className="col-span-6">Wallet</div>
                  <div className="col-span-3 text-right">Amount</div>
                  <div className="col-span-2 text-right">%</div>
                </div>

                {/* Holders List */}
                {holdersData?.holders.map((holder) => {
                  const amount = holder.balance / Math.pow(10, coinDecimals)
                  
                  return (
                    <div
                      key={holder.user}
                      className="grid grid-cols-12 gap-2 px-2 py-1.5 items-center hover:bg-muted/5 transition-colors border-b border-border/30"
                    >
                      {/* Rank */}
                      <div className="col-span-1">
                        <span className={cn(
                          "font-mono text-[11px]",
                          holder.rank <= 3 ? "text-primary font-semibold" : "text-muted-foreground"
                        )}>
                          {holder.rank}
                        </span>
                      </div>

                      {/* Wallet */}
                      <div className="col-span-6 flex items-center gap-1">
                        <CopyableAddress
                          address={holder.user}
                          className="text-[11px] hover:text-primary"
                          maxLength={8}
                        />
                        {holder.isCreator && (
                          <Badge 
                            variant="secondary" 
                            className="h-4 px-1 text-[9px] font-mono bg-primary/10 text-primary border-primary/20"
                          >
                            DEV
                          </Badge>
                        )}
                      </div>

                      {/* Amount */}
                      <div className="col-span-3 text-right">
                        <span className="font-mono text-[11px] text-foreground/80">
                          {formatAmountWithSuffix(amount)}
                        </span>
                      </div>

                      {/* Percentage */}
                      <div className="col-span-2 text-right">
                        <span className={cn(
                          "font-mono text-[11px]",
                          holder.percentage >= 5
                            ? "text-primary font-semibold"
                            : holder.percentage >= 1
                              ? "text-blue-400"
                              : "text-muted-foreground"
                        )}>
                          {holder.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}