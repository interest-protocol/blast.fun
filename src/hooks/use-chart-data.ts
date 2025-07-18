import { useEffect, useState } from 'react'
import { datafeedService, type Bar, type SymbolInfo } from '@/services/datafeed'

interface UseChartDataOptions {
    coinType: string
    resolution?: string
    countback?: number
    enabled?: boolean
}

interface UseChartDataReturn {
    bars: Bar[]
    loading: boolean
    error: Error | null
    latestPrice: number | null
    priceChange24h: number
    volume24h: number
    symbolInfo: SymbolInfo | null
}

const RESOLUTION_MAP: Record<string, string> = {
    '1': '1',      // 1 minute
    '60': '60',    // 1 hour
    '240': '240',  // 4 hours
    '1D': '1D',    // 1 day
    '1W': '1W',    // 1 week
}

export function useChartData({
    coinType,
    resolution = '60', // 1 hour default
    countback = 100,
    enabled = true
}: UseChartDataOptions): UseChartDataReturn {
    const [bars, setBars] = useState<Bar[]>([])
    const [symbolInfo, setSymbolInfo] = useState<SymbolInfo | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        if (!enabled || !coinType) return

        let mounted = true
        const fetchData = async () => {
            try {
                setLoading(true)
                setError(null)

                // First, find the symbol info by coin type
                const symbol = await datafeedService.findSymbolByCoinType(coinType)
                if (!symbol) {
                    console.log('Symbol not found for coin type:', coinType)
                    if (mounted) {
                        setBars([])
                        setSymbolInfo(null)
                    }
                    return
                }

                if (mounted) {
                    setSymbolInfo(symbol)
                }

                // Then fetch the OHLCV data using the full coin type
                const mappedResolution = RESOLUTION_MAP[resolution] || resolution
                const historicalBars = await datafeedService.getHistory(
                    symbol.type, // Use the full coin type from symbol info
                    mappedResolution,
                    countback
                )

                if (mounted) {
                    setBars(historicalBars)
                }
            } catch (err) {
                console.error('Chart data fetch error:', err)
                if (mounted) {
                    setError(err instanceof Error ? err : new Error('Failed to fetch chart data'))
                }
            } finally {
                if (mounted) {
                    setLoading(false)
                }
            }
        }

        fetchData()

        // Poll for updates every 30 seconds
        const interval = setInterval(fetchData, 30000)

        return () => {
            mounted = false
            clearInterval(interval)
        }
    }, [coinType, resolution, countback, enabled])

    // Calculate metrics
    const latestPrice = bars.length > 0 ? bars[bars.length - 1].close : null
    
    const priceChange24h = (() => {
        if (bars.length < 2) return 0
        const now = Date.now()
        const dayAgo = now - 24 * 60 * 60 * 1000
        const dayAgoBars = bars.filter(bar => bar.time >= dayAgo)
        if (dayAgoBars.length === 0) return 0
        
        const oldPrice = dayAgoBars[0].open
        const currentPrice = bars[bars.length - 1].close
        return oldPrice > 0 ? ((currentPrice - oldPrice) / oldPrice) * 100 : 0
    })()

    const volume24h = (() => {
        const now = Date.now()
        const dayAgo = now - 24 * 60 * 60 * 1000
        return bars
            .filter(bar => bar.time >= dayAgo)
            .reduce((sum, bar) => sum + bar.volume, 0)
    })()

    return {
        bars,
        loading,
        error,
        latestPrice,
        priceChange24h,
        volume24h,
        symbolInfo
    }
}