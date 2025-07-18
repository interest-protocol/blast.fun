// Memez GraphQL API service for chart data
const MEMEZ_GRAPHQL_URL = 'https://api.memez.interestlabs.io/v1/graphql'

export interface Trade {
    time: string
    price: string
    volume: number
    kind: 'buy' | 'sell'
    trader: string
    coinAmount: string
    quoteAmount: string
}

export interface OHLCV {
    time: number
    open: number
    high: number
    low: number
    close: number
    volume: number
}

export interface ChartData {
    ohlcv: OHLCV[]
    latestPrice: number
    priceChange24h: number
    volume24h: number
}

type Interval = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d'

export class MemezChartService {
    private cache = new Map<string, { data: any; timestamp: number }>()
    private cacheDuration = 60000 // 1 minute cache

    private getCacheKey(coinType: string, interval: Interval): string {
        return `${coinType}:${interval}`
    }

    private getFromCache(key: string): any | null {
        const cached = this.cache.get(key)
        if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
            return cached.data
        }
        return null
    }

    private setCache(key: string, data: any): void {
        this.cache.set(key, { data, timestamp: Date.now() })
    }

    // Fetch recent trades from Memez API
    async fetchTrades(coinType: string, limit: number = 1000): Promise<Trade[]> {
        const cacheKey = `trades:${coinType}:${limit}`
        const cached = this.getFromCache(cacheKey)
        if (cached) return cached

        try {
            // First, get the pool ID from coin type
            const poolData = await this.getPoolByCoinType(coinType)
            if (!poolData) {
                console.warn(`No pool found for coin type: ${coinType}`)
                return []
            }

            // Then fetch all trades and filter by this coin type
            const query = `
                query GetMarketTrades($limit: Int!) {
                    marketTrades(
                        page: 1, 
                        pageSize: $limit, 
                        sortBy: { field: time, direction: DESC }
                    ) {
                        trades {
                            time
                            type
                            price
                            volume
                            kind
                            trader
                            coinAmount
                            quoteAmount
                        }
                        total
                    }
                }
            `

            const response = await fetch(MEMEZ_GRAPHQL_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query,
                    variables: {
                        limit
                    }
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                console.error('GraphQL Error:', errorData)
                throw new Error(`GraphQL request failed: ${response.status}`)
            }

            const result = await response.json()
            const allTrades = result?.data?.marketTrades?.trades || []
            
            // Filter trades by coin type
            const trades = allTrades.filter((trade: any) => trade.type === coinType)
            
            this.setCache(cacheKey, trades)
            return trades
        } catch (error) {
            console.error('Failed to fetch trades:', error)
            return []
        }
    }

    // Transform trades into OHLCV candles
    transformTradesToOHLCV(trades: Trade[], interval: Interval): OHLCV[] {
        if (trades.length === 0) return []

        // Sort trades by time (oldest first)
        const sortedTrades = [...trades].sort((a, b) => 
            parseInt(a.time) - parseInt(b.time)
        )

        // Calculate interval duration in milliseconds
        const intervalMs = this.getIntervalMs(interval)
        
        // Group trades into time buckets
        const buckets = new Map<number, Trade[]>()
        
        sortedTrades.forEach(trade => {
            const timestamp = parseInt(trade.time)
            const bucketTime = Math.floor(timestamp / intervalMs) * intervalMs
            
            if (!buckets.has(bucketTime)) {
                buckets.set(bucketTime, [])
            }
            buckets.get(bucketTime)!.push(trade)
        })

        // Transform buckets into OHLCV
        const ohlcv: OHLCV[] = []
        
        buckets.forEach((bucketTrades, bucketTime) => {
            if (bucketTrades.length === 0) return

            const prices = bucketTrades.map(t => parseFloat(t.price))
            const volumes = bucketTrades.map(t => t.volume)
            
            ohlcv.push({
                time: bucketTime / 1000, // Convert to seconds
                open: prices[0],
                high: Math.max(...prices),
                low: Math.min(...prices),
                close: prices[prices.length - 1],
                volume: volumes.reduce((sum, v) => sum + v, 0)
            })
        })

        // Sort by time and limit to most recent candles
        return ohlcv.sort((a, b) => a.time - b.time).slice(-100)
    }

    // Get interval duration in milliseconds
    private getIntervalMs(interval: Interval): number {
        const intervals: Record<Interval, number> = {
            '1m': 60 * 1000,
            '5m': 5 * 60 * 1000,
            '15m': 15 * 60 * 1000,
            '30m': 30 * 60 * 1000,
            '1h': 60 * 60 * 1000,
            '4h': 4 * 60 * 60 * 1000,
            '1d': 24 * 60 * 60 * 1000
        }
        return intervals[interval]
    }

    // Calculate price statistics
    calculateStats(trades: Trade[]): { latestPrice: number; priceChange24h: number; volume24h: number } {
        if (trades.length === 0) {
            return { latestPrice: 0, priceChange24h: 0, volume24h: 0 }
        }

        const now = Date.now()
        const oneDayAgo = now - 24 * 60 * 60 * 1000

        // Get latest price
        const latestPrice = parseFloat(trades[0].price)

        // Filter trades from last 24 hours
        const trades24h = trades.filter(t => parseInt(t.time) >= oneDayAgo)
        
        if (trades24h.length === 0) {
            return { latestPrice, priceChange24h: 0, volume24h: 0 }
        }

        // Calculate 24h volume
        const volume24h = trades24h.reduce((sum, t) => sum + t.volume, 0)

        // Get price 24h ago (or oldest available)
        const oldestTrade = trades24h[trades24h.length - 1]
        const price24hAgo = parseFloat(oldestTrade.price)
        
        // Calculate price change percentage
        const priceChange24h = price24hAgo > 0 
            ? ((latestPrice - price24hAgo) / price24hAgo) * 100 
            : 0

        return { latestPrice, priceChange24h, volume24h }
    }

    // Main method to get chart data
    async getChartData(coinType: string, interval: Interval = '1h'): Promise<ChartData> {
        const cacheKey = this.getCacheKey(coinType, interval)
        const cached = this.getFromCache(cacheKey)
        if (cached) return cached

        try {
            // Fetch more trades for longer intervals
            const tradeLimit = interval === '1d' ? 2000 : 1000
            const trades = await this.fetchTrades(coinType, tradeLimit)
            
            if (trades.length === 0) {
                return {
                    ohlcv: [],
                    latestPrice: 0,
                    priceChange24h: 0,
                    volume24h: 0
                }
            }

            // Transform trades to OHLCV
            const ohlcv = this.transformTradesToOHLCV(trades, interval)
            
            // Calculate statistics
            const stats = this.calculateStats(trades)

            const chartData: ChartData = {
                ohlcv,
                ...stats
            }

            this.setCache(cacheKey, chartData)
            return chartData
        } catch (error) {
            console.error('Failed to get chart data:', error)
            return {
                ohlcv: [],
                latestPrice: 0,
                priceChange24h: 0,
                volume24h: 0
            }
        }
    }

    // Get pool by coin type
    async getPoolByCoinType(coinType: string): Promise<any> {
        try {
            const query = `
                query GetPoolByCoinType($coinType: String!) {
                    coinPool(type: $coinType) {
                        poolId
                        coinType
                        metadata
                        quoteBalance
                        coinBalance
                        bondingCurve
                        createdAt
                        lastTradeAt
                        creatorAddress
                    }
                }
            `

            const response = await fetch(MEMEZ_GRAPHQL_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query,
                    variables: { coinType }
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                console.error('GraphQL Error:', errorData)
                return null
            }

            const result = await response.json()
            return result?.data?.coinPool || null
        } catch (error) {
            console.error('Failed to fetch pool by coin type:', error)
            return null
        }
    }

    // Get pool information from Memez API
    async getPoolInfo(poolId: string): Promise<any> {
        try {
            const query = `
                query GetPool($poolId: String!) {
                    pool(poolId: $poolId) {
                        poolId
                        coinType
                        balance
                        coinBalance
                        virtualCoinReserves
                        virtualSuiReserves
                        lastTradeTime
                        metadata
                    }
                }
            `

            const response = await fetch(MEMEZ_GRAPHQL_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query,
                    variables: { poolId }
                })
            })

            if (!response.ok) {
                throw new Error(`GraphQL request failed: ${response.status}`)
            }

            const { data } = await response.json()
            return data?.pool || null
        } catch (error) {
            console.error('Failed to fetch pool info:', error)
            return null
        }
    }
}

export const memezChartService = new MemezChartService()