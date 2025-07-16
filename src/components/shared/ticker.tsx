'use client'

import React from 'react'
import { AlertTriangle } from 'lucide-react'

interface TickerProps {
    items?: string[]
}

export function Ticker({
    items
}: TickerProps) {
    if (!items || items.length <= 0) return null;

    const dystopianItems = items.map(item => `[${item.toUpperCase()}]`);

    return (
        <div className="w-full overflow-hidden bg-destructive/10 border-y-2 border-destructive/20 py-2 relative select-none">
            {/* indicators on edges */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-destructive/20 to-transparent z-10 flex items-center justify-start pl-2">
                <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-destructive/20 to-transparent z-10 flex items-center justify-end pr-2">
                <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />
            </div>

            {/* content */}
            <div className="relative flex">
                <div className="flex animate-ticker whitespace-nowrap">
                    {[...dystopianItems, ...dystopianItems].map((item, index) => (
                        <span key={index} className="mx-8 font-mono text-sm uppercase tracking-wider text-foreground/80">
                            <span className="text-destructive/60">ALERT::</span>
                            <span className="text-foreground/60">{item}</span>
                        </span>
                    ))}
                </div>
                <div className="flex animate-ticker whitespace-nowrap" aria-hidden="true">
                    {[...dystopianItems, ...dystopianItems].map((item, index) => (
                        <span key={`duplicate-${index}`} className="mx-8 font-mono text-sm uppercase tracking-wider text-foreground/80">
                            <span className="text-destructive/60">ALERT::</span>
                            <span className="text-foreground/60">{item}</span>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
}