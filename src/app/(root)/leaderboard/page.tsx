"use client"

import { Suspense, FC } from "react"
import { Logo } from "@/components/ui/logo"
import LeaderboardContent from "./leaderboard-content"

const LeaderboardPage: FC = () => (
  <Suspense
    fallback={
      <div className="container max-w-7xl mx-auto py-4">
        <div className="bg-card/50 border border-border/50 rounded-lg">
          <div className="p-8 text-center">
            <Logo className="w-12 h-12 mx-auto text-foreground/20 mb-4 animate-pulse" />
            <p className="font-mono text-sm uppercase text-muted-foreground">LOADING::LEADERBOARD</p>
          </div>
        </div>
      </div>
    }
  >
    <LeaderboardContent />
  </Suspense>
)

export default LeaderboardPage;