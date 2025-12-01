"use client"

import { FC } from "react"
import { Trophy } from "lucide-react"

import { LeaderboardEmptyProps } from "../leaderboard.types"

const LeaderboardEmpty:FC<LeaderboardEmptyProps> = ({
  title = "NO::TRADING::DATA",
  subtitle = "BE_THE_FIRST_TO_TRADE",
}) => (
  <div className="text-center py-12">
    <Trophy className="w-12 h-12 mx-auto text-foreground/20 mb-4 animate-pulse" />
    <p className="font-mono text-sm uppercase text-muted-foreground">{title}</p>
    <p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">{subtitle}</p>
  </div>
)

export default LeaderboardEmpty
