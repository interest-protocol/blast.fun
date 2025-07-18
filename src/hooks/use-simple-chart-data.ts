'use client'

import { useState, useEffect } from 'react'
import { memezSimpleChartService, type SimpleChartData } from '@/services/memez-simple-chart'

interface UseSimpleChartDataProps {
    poolId: string
    enabled?: boolean
}

export function useSimpleChartData({
    poolId,
    enabled = true
}: UseSimpleChartDataProps) {
    const [data, setData] = useState<SimpleChartData>({
        candles: [],
        latestPrice: 0,
        priceChange24h: 0,
        volume24h: 0
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        if (!enabled || !poolId) {
            setLoading(false)
            return
        }

        const fetchData = async () => {
            try {
                setLoading(true)
                setError(null)
                
                const chartData = await memezSimpleChartService.getChartDataByPoolId(poolId)
                setData(chartData)
            } catch (err) {
                console.error('Failed to fetch chart data:', err)
                setError(err instanceof Error ? err : new Error('Failed to fetch chart data'))
            } finally {
                setLoading(false)
            }
        }

        fetchData()
        
        // Refresh every minute
        const intervalId = setInterval(fetchData, 60000)
        
        return () => clearInterval(intervalId)
    }, [poolId, enabled])

    return {
        ohlcv: data.candles,
        latestPrice: data.latestPrice,
        priceChange24h: data.priceChange24h,
        volume24h: data.volume24h,
        loading,
        error,
        refetch: () => {} // For compatibility
    }
}