"use client"

import { PoolWithMetadata } from "@/types/pool"
import { Users, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/utils"
import { CopyableAddress } from "@/components/shared/copyable-address"
import { formatAmountWithSuffix } from "@/utils/format"
import { Badge } from "@/components/ui/badge"
import { useTopHolders } from "@/hooks/use-top-holders"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TopHoldersTabProps {
  pool: PoolWithMetadata
  className?: string
}

export function TopHoldersTab({ pool, className }: TopHoldersTabProps) {
  const { data: holdersData, isLoading, error } = useTopHolders(pool.coinType)
  const metadata = pool.coinMetadata
  const coinDecimals = metadata?.decimals || 9

  return (
    <ScrollArea className={cn(className || "h-[500px]")}>
      <div className="w-full">
        {isLoading ? (
          <div className="p-4 space-y-2">
            <div className="text-center py-16">
              <div className="relative inline-block">
                <Users className="w-16 h-16 mx-auto text-foreground/20 mb-4" />
                <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full animate-pulse" />
              </div>
              <p className="font-mono text-sm uppercase text-muted-foreground mb-2">
                TOP::HOLDERS::LOADING
              </p>
              <p className="font-mono text-xs uppercase text-muted-foreground/60">
                FETCHING_TOP_10_HOLDERS
              </p>
              <div className="flex items-center justify-center gap-1 mt-4">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150" />
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-300" />
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
            <p className="font-mono text-sm uppercase text-destructive">ERROR::LOADING::HOLDERS</p>
            <p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">DATA_UNAVAILABLE</p>
          </div>
        ) : holdersData?.holders.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-foreground/20 mb-4 animate-pulse" />
            <p className="font-mono text-sm uppercase text-muted-foreground">
              NO::HOLDERS::DETECTED
            </p>
            <p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">
              AWAITING_DISTRIBUTION
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Summary Header */}
            <div className="px-2 sm:px-4 py-3 border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider">
                TOP 10 HOLDERS
              </h3>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 px-2 sm:px-4 py-2 border-b border-border/50 text-[11px] sm:text-xs font-mono uppercase text-muted-foreground sticky top-[52px] bg-background/95 backdrop-blur-sm z-10 select-none">
              <div className="col-span-8">Wallet</div>
              <div className="col-span-4 text-right">%</div>
            </div>

            {/* Holders List */}
            {holdersData?.holders.map((holder) => {
              return (
                <div
                  key={holder.user}
                  className="relative group hover:bg-muted/5 transition-all duration-200"
                >
                  <div className="relative grid grid-cols-12 gap-2 px-2 sm:px-4 py-2 sm:py-3 items-center border-b border-border/30">
                    {/* Rank + Wallet */}
                    <div className="col-span-8 flex items-center gap-2">
                      <span className={cn(
                        "font-mono text-[11px] sm:text-xs",
                        holder.rank <= 3 ? "text-primary font-semibold" : "text-muted-foreground"
                      )}>
                        #{holder.rank}
                      </span>
                      <CopyableAddress
                        address={holder.user}
                        className="text-[11px] sm:text-xs hover:text-primary"
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
                        "font-mono text-[11px] sm:text-xs",
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
                </div>
              )
            })}
          </div>
        )}
      </div>
    </ScrollArea>
  )
}