// Simplified Memez chart service
const MEMEZ_GRAPHQL_URL = 'https://api.memez.interestlabs.io/v1/graphql'

export interface SimpleOHLCV {
    time: number
    open: number
    high: number  
    low: number
    close: number
    volume: number
}

export interface SimpleChartData {
    candles: SimpleOHLCV[]
    latestPrice: number
    priceChange24h: number
    volume24h: number
}

export class MemezSimpleChartService {
    // Get pool data with recent trades
    async getPoolWithPrice(poolId: string): Promise<any> {
        try {
            const query = `
                query GetPoolData($poolId: String!) {
                    pool(poolId: $poolId) {
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query,
                    variables: { poolId }
                })
            })

            if (!response.ok) {
                console.error('Failed to fetch pool data')
                return null
            }

            const result = await response.json()
            return result?.data?.pool || null
        } catch (error) {
            console.error('Pool fetch error:', error)
            return null
        }
    }

    // Calculate price from pool reserves (bonding curve)
    calculatePrice(pool: any): number {
        if (!pool || !pool.quoteBalance || !pool.coinBalance) return 0
        
        // Parse balances (they come as strings)
        const quoteBalance = parseFloat(pool.quoteBalance) / 1e9 // SUI has 9 decimals
        const coinBalance = parseFloat(pool.coinBalance) / 1e9 // Assume token has 9 decimals
        
        if (coinBalance === 0) return 0
        
        // Price in SUI per token
        const price = quoteBalance / coinBalance
        
        // Convert to USD (assuming 1 SUI = $1 for simplicity)
        // In production, you'd fetch actual SUI price
        return price
    }

    // Generate mock OHLCV data based on current price
    generateChartData(currentPrice: number, intervals: number = 24): SimpleChartData {
        const candles: SimpleOHLCV[] = []
        const now = Date.now()
        const intervalMs = 60 * 60 * 1000 // 1 hour
        
        // Generate candles with some random variation
        let price = currentPrice * 0.95 // Start 5% lower
        
        for (let i = intervals; i > 0; i--) {
            const time = now - (i * intervalMs)
            const variation = (Math.random() - 0.5) * 0.02 // ±2% variation
            
            const open = price
            const close = price * (1 + variation)
            const high = Math.max(open, close) * (1 + Math.random() * 0.01)
            const low = Math.min(open, close) * (1 - Math.random() * 0.01)
            const volume = Math.random() * 1000
            
            candles.push({
                time: Math.floor(time / 1000),
                open,
                high,
                low,
                close,
                volume
            })
            
            price = close
        }
        
        // Add current price as the latest candle
        candles.push({
            time: Math.floor(now / 1000),
            open: price,
            high: currentPrice * 1.01,
            low: price * 0.99,
            close: currentPrice,
            volume: Math.random() * 1000
        })
        
        // Calculate 24h change
        const firstPrice = candles[0].open
        const priceChange24h = ((currentPrice - firstPrice) / firstPrice) * 100
        
        // Calculate total volume
        const volume24h = candles.reduce((sum, c) => sum + c.volume, 0)
        
        return {
            candles,
            latestPrice: currentPrice,
            priceChange24h,
            volume24h
        }
    }

    // Main method to get chart data for a pool
    async getChartDataByPoolId(poolId: string): Promise<SimpleChartData> {
        try {
            const pool = await this.getPoolWithPrice(poolId)
            if (!pool) {
                return {
                    candles: [],
                    latestPrice: 0,
                    priceChange24h: 0,
                    volume24h: 0
                }
            }

            const currentPrice = this.calculatePrice(pool)
            return this.generateChartData(currentPrice)
        } catch (error) {
            console.error('Chart data error:', error)
            return {
                candles: [],
                latestPrice: 0,
                priceChange24h: 0,
                volume24h: 0
            }
        }
    }
}

export const memezSimpleChartService = new MemezSimpleChartService()