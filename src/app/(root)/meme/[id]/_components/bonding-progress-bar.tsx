"use client"

import { Rocket } from "lucide-react"
import type { PoolWithMetadata } from "@/types/pool"
import { cn } from "@/utils"
import { useBondingProgress } from "@/hooks/use-bonding-progress"

interface BondingProgressBarProps {
    pool: PoolWithMetadata
}

export function BondingProgressBar({ pool }: BondingProgressBarProps) {
    const { data } = useBondingProgress(pool.coinType)
    
    // Use real-time data if available, otherwise fall back to pool data
    const progress = data?.progress ?? (typeof pool.bondingCurve === "number"
        ? pool.bondingCurve
        : parseFloat(pool.bondingCurve) || 0)

    const isComplete = progress >= 100

    return (
        <div className="relative border-b border-border">
            <div className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/* Indicator */}
                        <div className="relative flex items-center justify-center">
                            <div className={cn(
                                "absolute w-2 h-2 rounded-full",
                                isComplete ? "bg-green-400 animate-ping" : "bg-blue-400 animate-pulse"
                            )} />
                            <div className={cn(
                                "w-2 h-2 rounded-full",
                                isComplete ? "bg-green-400" : "bg-blue-400"
                            )} />
                        </div>

                        <div className="flex flex-col">
                            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                                Bonding Curve Progress
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-bold text-foreground">
                                    {Math.round(progress)}% Complete
                                </span>
                                {isComplete && (
                                    <span className="font-mono text-xs text-green-400">
                                        • Ready
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/20 border border-border/50">
                    <div
                        className={cn(
                            "absolute left-0 top-0 h-full transition-all duration-500 ease-out",
                            isComplete
                                ? "bg-green-400"
                                : "bg-gradient-to-r from-blue-400/60 to-blue-400"
                        )}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                </div>
            </div>
        </div>
    )
}