"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/utils/index"
import { FC } from "react"
import { CycleSelectorProps } from "../leaderboard.types"

const CycleSelector:FC<CycleSelectorProps> = ({
  currentCycle,
  selectedCycle,
  availableCycles,
  onCycleChange,
  loading,
  getCycleDateRange,
}) => (
  <Select
    value={(selectedCycle ?? currentCycle).toString()}
    onValueChange={(value) => onCycleChange(Number.parseInt(value))}
    disabled={loading}
  >
    <SelectTrigger
      className={cn(
        "w-[140px] h-auto px-3 py-1 text-xs font-mono uppercase",
        "bg-card/50 backdrop-blur-sm border border-border/50",
        "text-muted-foreground hover:text-foreground hover:bg-muted/50",
        "disabled:opacity-50 disabled:cursor-not-allowed",
      )}
      size="sm"
    >
      <SelectValue>
        {selectedCycle === undefined || selectedCycle === currentCycle ? "CURRENT" : `CYCLE ${selectedCycle + 1}`}
      </SelectValue>
    </SelectTrigger>
    <SelectContent className="font-mono text-xs">
      {availableCycles.reverse().map((cycle) => (
        <SelectItem key={cycle} value={cycle.toString()} className="font-mono text-xs">
          {cycle === currentCycle ? (
            <span className="flex items-center gap-2">
              <span className="text-destructive">●</span>
              <span>Current ({getCycleDateRange(cycle)})</span>
            </span>
          ) : (
            <span>
              Cycle {cycle + 1} ({getCycleDateRange(cycle)})
            </span>
          )}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)

export default CycleSelector
