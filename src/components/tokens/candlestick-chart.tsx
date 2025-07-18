'use client'

import React from 'react'
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { formatNumber } from '@/utils/format'
import type { Bar as BarType } from '@/services/datafeed'

interface CandlestickChartProps {
    bars: BarType[]
    height?: number
}

const chartConfig = {
    candlestick: {
        label: "Price",
        color: "hsl(var(--primary))",
    },
}

export function CandlestickChart({ bars, height = 320 }: CandlestickChartProps) {
    const chartData = bars.map(bar => {
        const isGreen = bar.close >= bar.open
        return {
            time: new Date(bar.time).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            }),
            open: bar.open,
            high: bar.high,
            low: bar.low,
            close: bar.close,
            volume: bar.volume,
            color: isGreen ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))',
            bodyHeight: Math.abs(bar.close - bar.open),
            bodyY: Math.max(bar.open, bar.close),
            wickHigh: bar.high,
            wickLow: bar.low,
        }
    })

    const minPrice = Math.min(...bars.map(b => b.low))
    const maxPrice = Math.max(...bars.map(b => b.high))
    const priceRange = maxPrice - minPrice
    const yDomain = [minPrice - priceRange * 0.1, maxPrice + priceRange * 0.1]

    return (
        <ChartContainer config={chartConfig} className="h-[320px] w-full">
            <ComposedChart
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
                            formatter={(value, name) => {
                                if (name === 'bodyHeight') return null
                                return [`$${formatNumber(value as number, 6)}`, name.toUpperCase()]
                            }}
                        />
                    }
                />
                
                {/* Wicks */}
                {chartData.map((entry, index) => (
                    <Line
                        key={`wick-${index}`}
                        type="monotone"
                        dataKey="wickHigh"
                        stroke={entry.color}
                        strokeWidth={1}
                        dot={false}
                    />
                ))}
                
                {/* Bodies */}
                <Bar dataKey="bodyHeight" maxBarSize={10}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Bar>
            </ComposedChart>
        </ChartContainer>
    )
}