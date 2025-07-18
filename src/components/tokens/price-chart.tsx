'use client'

import React from 'react'
import { Line, LineChart, XAxis, YAxis, CartesianGrid } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { formatNumber } from '@/utils/format'
interface Bar {
    time: number
    open: number
    high: number
    low: number
    close: number
    volume: number
}

interface PriceChartProps {
    bars: Bar[]
    height?: number
}

const chartConfig = {
    price: {
        label: "Price",
        color: "hsl(var(--primary))",
    },
}

export function PriceChart({ bars, height = 320 }: PriceChartProps) {
    const chartData = bars.map(bar => ({
        time: new Date(bar.time * 1000).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        }),
        price: bar.close,
    }))

    const minPrice = Math.min(...bars.map(b => b.low))
    const maxPrice = Math.max(...bars.map(b => b.high))
    const priceRange = maxPrice - minPrice
    const yDomain = [minPrice - priceRange * 0.1, maxPrice + priceRange * 0.1]

    return (
        <ChartContainer config={chartConfig} className="h-[320px] w-full">
            <LineChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                    dataKey="time"
                    className="text-muted-foreground"
                    tick={{ fontSize: 10, fontFamily: 'monospace' }}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    domain={yDomain}
                    className="text-muted-foreground"
                    tick={{ fontSize: 10, fontFamily: 'monospace' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${formatNumber(value, 6)}`}
                    width={80}
                />
                <ChartTooltip
                    content={
                        <ChartTooltipContent 
                            className="font-mono"
                            formatter={(value) => [`$${formatNumber(value as number, 6)}`, 'PRICE']}
                        />
                    }
                />
                <Line
                    type="monotone"
                    dataKey="price"
                    stroke="var(--color-price)"
                    strokeWidth={2}
                    dot={false}
                />
            </LineChart>
        </ChartContainer>
    )
}