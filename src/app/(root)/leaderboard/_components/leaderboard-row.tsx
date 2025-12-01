"use client"

import { Trophy, Medal } from "lucide-react"
import { formatAddress } from "@mysten/sui/utils"
import { formatPrice } from "@/lib/format"
import { FC } from "react"
import { LeaderboardRowProps } from "../leaderboard.types"

const LeaderboardRow:FC<LeaderboardRowProps> = ({ rank, user, totalVolume, tradeCount, suinsName }: LeaderboardRowProps) => {
  const getRankDisplay = (rank: number) => {
    if (rank === 1) return <Trophy className="h-4 w-4 text-yellow-500" />
    if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" />
    if (rank === 3) return <Medal className="h-4 w-4 text-amber-600" />
    return <span className="text-xs font-mono text-muted-foreground">#{rank}</span>
  }
  
  const icon = getRankDisplay(rank)

  return (
    <div className="relative group hover:bg-muted/5 transition-all duration-200">
      <div className="relative grid grid-cols-12 py-2 sm:py-3 items-center border-b border-border/30">
        {/* Rank */}
        <div className="col-span-1 flex justify-center">{icon}</div>

        {/* Trader Address */}
        <div className="col-span-5 flex items-center gap-2 pl-2">
          <div className="flex-1">
            {suinsName ? (
              <a
                href={`https://suivision.xyz/account/${user}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col hover:opacity-80 transition-opacity"
              >
                <span className="font-mono text-[10px] sm:text-xs text-foreground">{suinsName}</span>
                <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground">{formatAddress(user)}</span>
              </a>
            ) : (
              <a
                href={`https://suivision.xyz/account/${user}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] sm:text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <span className="sm:hidden">{formatAddress(user).slice(0, 6) + "..."}</span>
                <span className="hidden sm:inline">{formatAddress(user)}</span>
              </a>
            )}
          </div>
        </div>

        {/* Volume */}
        <div className="col-span-3 text-right">
          <span className="font-mono text-[10px] sm:text-xs text-foreground/80">{formatPrice(totalVolume || 0)}</span>
        </div>

        {/* Trades */}
        <div className="col-span-3 text-right pr-4">
          <span className="font-mono text-[10px] sm:text-xs text-foreground/60">
            {(tradeCount || 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}

export default LeaderboardRow
