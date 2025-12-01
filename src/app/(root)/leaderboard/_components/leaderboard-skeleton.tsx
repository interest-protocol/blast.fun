"use client"

import { FC } from "react"

import { Skeleton } from "@/components/ui/skeleton"

const LeaderboardSkeleton: FC = () => (
  <div className="w-full">
    <div className="relative">
      <div className="grid grid-cols-12 py-2 border-b border-border/50 text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground sticky top-0 bg-card/95 backdrop-blur-sm z-10 select-none">
        <div className="col-span-1"></div>
        <div className="col-span-5 pl-2">
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="col-span-3 flex justify-end">
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="col-span-3 flex justify-end pr-4">
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      {Array.from({ length: 15 }).map((_, i) => (
        <div key={i} className="relative group">
          <div className="relative grid grid-cols-12 py-2 sm:py-3 items-center border-b border-border/30">
            <div className="col-span-1 flex justify-center">
              <Skeleton className="h-4 w-4 rounded" />
            </div>
            <div className="col-span-5 pl-2">
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="col-span-3 flex justify-end">
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="col-span-3 flex justify-end pr-4">
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)

export default LeaderboardSkeleton
