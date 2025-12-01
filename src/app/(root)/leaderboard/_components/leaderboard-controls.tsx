"use client"

import type React from "react"

import { Download, Copy, Check } from "lucide-react"
import { cn } from "@/utils/index"
import { FC } from "react"
import { LeaderboardControlsProps } from "../leaderboard.types"

const LeaderboardControls:FC<LeaderboardControlsProps> = ({
  timeRange,
  onTimeRangeChange,
  loading,
  copied,
  onCopy,
  onExport,
  dataEmpty,
  cycleSelector,
}) => (
  <div className="flex justify-between items-center mb-3">
    <div className="p-0.5 bg-card/50 backdrop-blur-sm border border-border/50 rounded-md flex items-center">
      {(["24h", "7d", "14d", "all"] as const).map((range) => (
        <button
          key={range}
          onClick={() => onTimeRangeChange(range)}
          disabled={loading}
          className={cn(
            "px-3 py-1 text-xs font-mono uppercase transition-all rounded",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            timeRange === range
              ? "bg-destructive/80 backdrop-blur-sm text-destructive-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
          )}
          title={range === "14d" ? "Current reward cycle" : range === "all" ? "All time since Sep 5" : undefined}
        >
          {range === "24h" && "24H"}
          {range === "7d" && "7D"}
          {range === "14d" && "CYCLE"}
          {range === "all" && "ALL"}
        </button>
      ))}
    </div>

    <div className="flex items-center gap-2">
      {cycleSelector}

      <button
        onClick={onCopy}
        disabled={loading || dataEmpty}
        className={cn(
          "px-3 py-1 text-xs font-mono uppercase transition-all rounded",
          "bg-card/50 backdrop-blur-sm border border-border/50",
          "text-muted-foreground hover:text-foreground hover:bg-muted/50",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "flex items-center gap-1.5",
        )}
        title="Copy as TSV to clipboard"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-green-500" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            Copy
          </>
        )}
      </button>

      <button
        onClick={onExport}
        disabled={loading || dataEmpty}
        className={cn(
          "px-3 py-1 text-xs font-mono uppercase transition-all rounded",
          "bg-card/50 backdrop-blur-sm border border-border/50",
          "text-muted-foreground hover:text-foreground hover:bg-muted/50",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "flex items-center gap-1.5",
        )}
        title="Download CSV"
      >
        <Download className="h-3.5 w-3.5" />
        Download
      </button>
    </div>
  </div>
)

export default LeaderboardControls
