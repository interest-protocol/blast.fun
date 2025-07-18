'use client'

import React from 'react'
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts'
import { formatNumber } from '@/utils/format'
import type { OHLCV } from '@/services/memez-chart-service'

interface OHLCVChartProps {
    data: OHLCV[]
    height?: number
}

export function OHLCVChart({ data, height = 320 }: OHLCVChartProps) {
    if (data.length === 0) return null

    // Transform data for candlestick visualization
    const chartData = data.map((candle, index) => {
        const isGreen = candle.close >= candle.open
        const bodyHeight = Math.abs(candle.close - candle.open)
        const bodyY = Math.max(candle.open, candle.close)
        
        return {
            ...candle,
            time: new Date(candle.time * 1000).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            }),
            color: isGreen ? '#10b981' : '#ef4444',
            bodyHeight,
            bodyY,
            index
        }
    })

    const minPrice = Math.min(...data.map(d => d.low))
    const maxPrice = Math.max(...data.map(d => d.high))
    const priceRange = maxPrice - minPrice
    const yDomain = [minPrice - priceRange * 0.1, maxPrice + priceRange * 0.1]

    return (
        <ResponsiveContainer width="100%" height={height}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                    dataKey="time"
                    tick={{ fontSize: 10, fontFamily: 'monospace', fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    domain={yDomain}
                    tick={{ fontSize: 10, fontFamily: 'monospace', fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${formatNumber(value, 8)}`}
                    width={80}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                        padding: '8px',
                        fontFamily: 'monospace',
                        fontSize: '12px'
                    }}
                    formatter={(value: any, name: string) => {
                        if (name === 'bodyHeight' || name === 'bodyY') return null
                        return [`$${formatNumber(value, 8)}`, name.toUpperCase()]
                    }}
                    labelFormatter={(label) => `TIME: ${label}`}
                />
                
                {/* High/Low wicks */}
                {chartData.map((entry, index) => (
                    <Line
                        key={`wick-${index}`}
                        type="monotone"
                        dataKey={() => [entry.low, entry.high]}
                        stroke={entry.color}
                        strokeWidth={1}
                        dot={false}
                        isAnimationActive={false}
                    />
                ))}
                
                {/* Candle bodies */}
                <Bar dataKey="bodyHeight" maxBarSize={8}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Bar>
            </ComposedChart>
        </ResponsiveContainer>
    )
}