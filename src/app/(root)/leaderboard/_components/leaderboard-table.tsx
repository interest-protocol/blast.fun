"use client"

import { Loader2 } from "lucide-react"
import { cn } from "@/utils/index"
import { LeaderboardRow } from "./leaderboard-row"
import { LeaderboardHeader } from "./leaderboard-header"
import { LeaderboardTableProps } from "../leaderboard.types"
import { FC } from "react"

export const LeaderboardTable:FC<LeaderboardTableProps> = ({
  data,
  suinsNames,
  sortBy,
  onSort,
  hasMore,
  loadingMore,
  onLoadMore,
}) => (
  <div className="w-full">
    <div className="relative">
      <LeaderboardHeader sortBy={sortBy} onSort={onSort} />

      {/* Table Body */}
      {data.map((entry, index) => {
        const rank = entry.rank || index + 1
        const suinsName = suinsNames?.[entry.user]

        if (!entry.user) {
          console.warn("Entry missing user:", entry)
          return null
        }

        return (
          <LeaderboardRow
            key={`${entry.user}-${index}`}
            rank={rank}
            user={entry.user}
            totalVolume={entry.totalVolume}
            tradeCount={entry.tradeCount}
            suinsName={suinsName}
          />
        )
      })}

      {/* Load More Button */}
      {hasMore && !loadingMore && (
        <div className="flex justify-center items-center py-6">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className={cn(
              "px-6 py-2 font-mono text-xs uppercase transition-all",
              "bg-destructive/10 hover:bg-destructive/20 border border-destructive/30",
              "text-destructive rounded-md",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center gap-2",
            )}
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </button>
        </div>
      )}

      {/* End of list indicator */}
      {!hasMore && data.length > 0 && (
        <div className="flex justify-center items-center py-4">
          <span className="font-mono text-xs text-muted-foreground uppercase">End of leaderboard</span>
        </div>
      )}
    </div>
  </div>
)
