"use client"

import { ArrowDown } from "lucide-react"
import { LeaderboardHeaderProps } from "../leaderboard.types"
import { FC } from "react"

export const LeaderboardHeader:FC<LeaderboardHeaderProps> = ({ sortBy, onSort }) => (
  <div className="grid grid-cols-12 py-2 border-b border-border/50 text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground sticky top-0 bg-card/95 backdrop-blur-sm z-10 select-none">
    <div className="col-span-1 text-center"></div>
    <div className="col-span-5 pl-2">TRADER</div>
    <div
      className="col-span-3 text-right cursor-pointer hover:text-foreground transition-colors flex justify-end items-center gap-1"
      onClick={() => onSort("volume")}
    >
      VOLUME
      {sortBy === "volume" && <ArrowDown className="h-3 w-3" />}
    </div>
    <div
      className="col-span-3 text-right pr-4 cursor-pointer hover:text-foreground transition-colors flex justify-end items-center gap-1"
      onClick={() => onSort("trades")}
    >
      TRADES
      {sortBy === "trades" && <ArrowDown className="h-3 w-3" />}
    </div>
  </div>
)
