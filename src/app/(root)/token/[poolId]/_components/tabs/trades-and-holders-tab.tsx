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
    <div className={cn("flex flex-row h-full gap-px bg-border", className)}>
      {/* Trades Section - 50% width */}
      <div className="w-1/2 h-full bg-background">
        <TradesTab pool={pool} className="h-full" isVisible={isVisible} />
      </div>

      {/* Holders Section - 50% width */}
      <div className="w-1/2 h-full bg-background">
        <ScrollArea className="h-full">
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
              <div className="relative">
                {/* Header matching trades header */}
                <div className="grid grid-cols-12 gap-2 px-2 sm:px-4 py-2 border-b border-border/50 text-[10px] sm:text-xs font-mono uppercase text-muted-foreground sticky top-0 bg-background/95 backdrop-blur-sm z-10 select-none">
                  <div className="col-span-8">TOP 10 HOLDERS</div>
                  <div className="col-span-4 text-right">%</div>
                </div>

                {/* Holders List */}
                {holdersData?.holders.map((holder) => {
                  return (
                    <div
                      key={holder.user}
                      className="grid grid-cols-12 gap-2 px-2 sm:px-4 py-2 sm:py-3 items-center border-b border-border/30 hover:bg-muted/5 transition-colors"
                    >
                      {/* Rank + Wallet */}
                      <div className="col-span-8 flex items-center gap-2">
                        <span className={cn(
                          "font-mono text-[10px] sm:text-xs",
                          holder.rank <= 3 ? "text-primary font-semibold" : "text-muted-foreground"
                        )}>
                          #{holder.rank}
                        </span>
                        <CopyableAddress
                          address={holder.user}
                          className="text-[10px] sm:text-xs text-muted-foreground hover:text-primary"
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
                        {holder.user === "0x0000000000000000000000000000000000000000000000000000000000000000" && (
                          <Badge 
                            variant="secondary" 
                            className="h-4 px-1 text-[9px] font-mono bg-destructive/10 text-destructive border-destructive/20"
                          >
                            BURNED
                          </Badge>
                        )}
                      </div>

                      {/* Percentage */}
                      <div className="col-span-4 text-right">
                        <span className={cn(
                          "font-mono text-[10px] sm:text-xs",
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
  )
}