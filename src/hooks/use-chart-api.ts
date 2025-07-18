'use client'

import { useState, useEffect } from 'react'

interface UseChartApiProps {
    coinType: string
    interval?: string
    enabled?: boolean
}

export function useChartApi({
    coinType,
    interval = '1h',
    enabled = true
}: UseChartApiProps) {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        if (!enabled || !coinType) {
            setLoading(false)
            return
        }

        const fetchData = async () => {
            try {
                setLoading(true)
                setError(null)

                const params = new URLSearchParams({
                    coinType,
                    interval
                })

                const response = await fetch(`/api/charts/ohlcv?${params}`)
                
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`)
                }

                const chartData = await response.json()
                setData(chartData)
            } catch (err) {
                console.error('Failed to fetch from API:', err)
                setError(err instanceof Error ? err : new Error('Failed to fetch chart data'))
            } finally {
                setLoading(false)
            }
        }

        fetchData()
        
        // Refresh every 30 seconds
        const intervalId = setInterval(fetchData, 30000)
        
        return () => clearInterval(intervalId)
    }, [coinType, interval, enabled])

    return { data, loading, error }
}