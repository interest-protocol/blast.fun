'use client'

import { useState, useEffect } from 'react'
import { memezChartService, type ChartData, type Interval } from '@/services/memez-chart-service'

interface UseMemezChartDataProps {
    coinType: string
    interval?: Interval
    enabled?: boolean
}

interface UseMemezChartDataReturn extends ChartData {
    loading: boolean
    error: Error | null
    refetch: () => void
}

export function useMemezChartData({
    coinType,
    interval = '1h',
    enabled = true
}: UseMemezChartDataProps): UseMemezChartDataReturn {
    const [data, setData] = useState<ChartData>({
        ohlcv: [],
        latestPrice: 0,
        priceChange24h: 0,
        volume24h: 0
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchData = async () => {
        if (!enabled || !coinType) return

        try {
            setLoading(true)
            setError(null)
            
            const chartData = await memezChartService.getChartData(coinType, interval)
            setData(chartData)
        } catch (err) {
            console.error('Failed to fetch chart data:', err)
            setError(err instanceof Error ? err : new Error('Failed to fetch chart data'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()

        // Refresh data every 30 seconds
        const intervalId = setInterval(fetchData, 30000)

        return () => clearInterval(intervalId)
    }, [coinType, interval, enabled])

    return {
        ...data,
        loading,
        error,
        refetch: fetchData
    }
}