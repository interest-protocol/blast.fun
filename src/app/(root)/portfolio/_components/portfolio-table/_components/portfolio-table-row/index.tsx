"use client"

import { FC } from "react"
import Image from "next/image"
import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/utils"
import { formatNumber, formatPrice, formatTokenAmount } from "@/lib/format"
import { useRouter } from "next/navigation"
import { PortfolioTableRowProps } from "./portfolio-table-row.types"

export const PortfolioTableRow: FC<PortfolioTableRowProps> = ({ item }) => {
  const router = useRouter()
  const pnlPercentage = item.value > 0 ? (item.unrealizedPnl / item.value) * 100 : 0
  const isProfitable = item.unrealizedPnl >= 0

  return (
    <tr
      className="hover:bg-muted/20 transition-colors cursor-pointer"
      onClick={() => {
        const param = item.coinMetadata?.poolId || item.coinType
        if (param) {
          router.push(`/token/${param.includes("::") ? encodeURIComponent(param) : param}`)
        }
      }}
    >
      <td className="px-3 md:px-6 py-4">
        <div className="flex items-center gap-2 md:gap-3">
          {(item.coinMetadata?.iconUrl || item.coinMetadata?.icon_url) && (
            <div className="relative w-8 h-8">
              <Image
                src={item.coinMetadata.iconUrl || item.coinMetadata.icon_url || ""}
                alt={item.coinMetadata.symbol || ""}
                fill
                className="rounded-full object-cover"
                onError={(e) => (e.currentTarget.style.display = "none")}
                unoptimized
              />
            </div>
          )}
          <div>
            <p className="font-mono font-semibold uppercase text-foreground/80">
              {item.coinMetadata?.symbol || "[UNKNOWN]"}
            </p>
            <p className="font-mono text-xs text-muted-foreground/60">
              {item.coinMetadata?.name || "[UNNAMED TOKEN]"}
            </p>
          </div>
        </div>
      </td>

      <td className="px-3 md:px-6 py-4 text-right">
        <div className="flex flex-col items-end">
          <p className="font-mono font-semibold text-sm md:text-base text-foreground/80">
            {formatTokenAmount(item.balance, item.coinMetadata?.decimals || 9)}
          </p>
          <p className="font-mono text-xs text-muted-foreground/60">
            ${formatNumber(item.value)}
          </p>
        </div>
      </td>

      <td className="hidden md:table-cell px-6 py-4 text-right">
        <p className="font-mono text-sm">{formatPrice(item.averageEntryPrice)}</p>
      </td>

      <td className="hidden md:table-cell px-6 py-4 text-right">
        <p className="font-mono text-sm">{formatPrice(item.price)}</p>
      </td>

      <td className="px-3 md:px-6 py-4 text-right">
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1">
            {isProfitable ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
            <p
              className={cn(
                "font-mono font-semibold",
                isProfitable ? "text-green-500" : "text-destructive"
              )}
            >
              ${formatNumber(Math.abs(item.unrealizedPnl))}
            </p>
          </div>
          <p
            className={cn(
              "font-mono text-xs",
              isProfitable ? "text-green-500" : "text-destructive"
            )}
          >
            {isProfitable ? "+" : ""}
            {pnlPercentage.toFixed(2)}%
          </p>
        </div>
      </td>
    </tr>
  )
}
