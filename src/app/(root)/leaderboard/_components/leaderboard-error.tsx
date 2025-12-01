"use client"

import { FC } from "react"
import { Logo } from "@/components/ui/logo"
import { LeaderboardEmptyProps as LeaderboardErrorProps } from "../leaderboard.types"

const LeaderboardError:FC<LeaderboardErrorProps> = ({
  title = "ERROR::LOADING::LEADERBOARD",
  subtitle = "CHECK_CONNECTION",
}) => (
  <div className="p-8 text-center">
    <Logo className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
    <p className="font-mono text-sm uppercase text-destructive">{title}</p>
    <p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">{subtitle}</p>
  </div>
)

export default LeaderboardError
