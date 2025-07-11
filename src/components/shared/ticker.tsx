'use client'

import React from 'react'

interface TickerProps {
    items?: string[]
}

export function Ticker({
    items
}: TickerProps) {
    if (!items || items.length <= 0) return null;

    return (
        <div className="w-full overflow-hidden bg-primary text-primary-foreground py-2">
            <div className="relative flex">
                <div className="flex animate-ticker whitespace-nowrap">
                    {[...items, ...items].map((item, index) => (
                        <span key={index} className="mx-8 text-sm font-medium">
                            {item}
                        </span>
                    ))}
                </div>
                <div className="flex animate-ticker whitespace-nowrap" aria-hidden="true">
                    {[...items, ...items].map((item, index) => (
                        <span key={`duplicate-${index}`} className="mx-8 text-sm font-medium">
                            {item}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
}