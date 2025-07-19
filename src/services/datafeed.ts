// Railway Datafeed API service
const RAILWAY_DATAFEED_URL = "https://datafeed-rest-production.up.railway.app/api/v1/datafeed"
const MEMEZ_GRAPHQL_URL = "https://api.memez.interestlabs.io/v1/graphql"

export interface Bar {
	time: number
	open: number
	high: number
	low: number
	close: number
	volume: number
}

export interface OHLCVData {
	time: number
	open: string
	high: string
	low: string
	close: string
	volume: string
}

export interface SymbolInfo {
	type: string // Full coin type (e.g., "0x8196...::meme::MEME")
	symbol: string
	name: string
	description: string
	decimals: number
	id: string
	iconUrl?: string
}

export interface MarketTrade {
	time: string
	type: string
	price: string
	volume: number
	trader: string
	kind: "buy" | "sell"
	quoteAmount: string
	coinAmount: string
	digest: string
}

export class DatafeedService {
	// Search for symbols by coin type or name
	async searchSymbols(search: string, limit = 20): Promise<SymbolInfo[]> {
		const url = `${RAILWAY_DATAFEED_URL}/symbols?search=${encodeURIComponent(search)}&limit=${limit}`
		console.log("🌐 Fetching symbols from:", url)

		try {
			const response = await fetch(url, {
				method: "GET",
				headers: {
					Accept: "application/json",
				},
				signal: AbortSignal.timeout(10000), // 10 second timeout
			})
			console.log("📡 Response status:", response.status)

			if (response.status === 500 || response.status === 503) {
				console.warn("⚠️ Datafeed API is temporarily unavailable")
				return []
			}

			if (!response.ok) {
				const errorText = await response.text()
				console.error("❌ API Error:", errorText)
				throw new Error(`Failed to search symbols: ${response.status} ${response.statusText}`)
			}

			const data = await response.json()
			console.log("📦 Response data:", Array.isArray(data) ? `Array of ${data.length} items` : "Not an array")

			return data
		} catch (error) {
			console.error("❌ Symbol search error:", error)
			if (error instanceof Error && error.name === "AbortError") {
				console.error("🕐 Request timed out")
			}
			return []
		}
	}

	// Find symbol by exact coin type
	async findSymbolByCoinType(coinType: string): Promise<SymbolInfo | null> {
		console.log("🔍 Finding symbol for coin type:", coinType)

		try {
			// First try exact match with full coin type
			console.log("🔍 Searching with full coin type...")
			const symbols = await this.searchSymbols(coinType, 100)
			console.log(`📊 Found ${symbols.length} symbols with full search`)

			const exactMatch = symbols.find((s) => s.type === coinType)
			if (exactMatch) {
				console.log("✅ Found exact match:", exactMatch)
				return exactMatch
			}

			// Try partial match with last part of coin type
			const parts = coinType.split("::")
			if (parts.length > 1) {
				const symbolName = parts[parts.length - 1]
				console.log(`🔍 Trying partial search with symbol name: ${symbolName}`)
				const partialSymbols = await this.searchSymbols(symbolName, 50)
				console.log(`📊 Found ${partialSymbols.length} symbols with partial search`)

				// Log first few results for debugging
				if (partialSymbols.length > 0) {
					console.log(
						"📋 First few results:",
						partialSymbols.slice(0, 3).map((s) => ({
							symbol: s.symbol,
							name: s.name,
							type: s.type,
						}))
					)
				}

				const match = partialSymbols.find((s) => s.type === coinType)
				if (match) {
					console.log("✅ Found match in partial search:", match)
					return match
				}
			}

			console.log("❌ No symbol found for coin type:", coinType)
			return null
		} catch (error) {
			console.error("❌ Find symbol error:", error)
			return null
		}
	}

	// Get all available symbols
	async getAllSymbols(limit = 100): Promise<SymbolInfo[]> {
		try {
			const url = `${RAILWAY_DATAFEED_URL}/symbols?limit=${limit}`
			console.log("📋 Fetching all symbols from:", url)

			const response = await fetch(url)
			if (!response.ok) {
				throw new Error(`Failed to fetch all symbols: ${response.status}`)
			}

			const data = await response.json()
			console.log(`📊 Total symbols available: ${data.length}`)
			return data
		} catch (error) {
			console.error("❌ Get all symbols error:", error)
			return []
		}
	}

	// Get OHLCV history data
	async getHistory(
		symbol: string, // This should be the full coin type
		resolution: string,
		countback = 100
	): Promise<Bar[]> {
		try {
			const params = new URLSearchParams({
				symbol: symbol,
				resolution: resolution,
				countback: countback.toString(),
			})

			const url = `${RAILWAY_DATAFEED_URL}/history?${params}`
			console.log("📈 Fetching OHLCV data:", url)

			const response = await fetch(url, {
				method: "GET",
				headers: {
					Accept: "application/json",
				},
				signal: AbortSignal.timeout(10000), // 10 second timeout
			})
			console.log("📡 History response status:", response.status)

			if (response.status === 500 || response.status === 503) {
				console.warn("⚠️ Datafeed API is temporarily unavailable")
				return []
			}

			if (!response.ok) {
				const errorText = await response.text()
				console.error("❌ History API Error:", errorText)
				throw new Error(`Failed to fetch history: ${response.status} ${response.statusText}`)
			}

			const data: OHLCVData[] = await response.json()
			console.log(`📊 Received ${data?.length || 0} candles`)

			if (!data || data.length === 0) {
				console.log("⚠️ No OHLCV data returned")
				return []
			}

			// Convert OHLCV data to Bar objects
			return data.map((candle) => ({
				time: candle.time * 1000, // Convert to milliseconds
				open: parseFloat(candle.open),
				high: parseFloat(candle.high),
				low: parseFloat(candle.low),
				close: parseFloat(candle.close),
				volume: parseFloat(candle.volume),
			}))
		} catch (error) {
			console.error("❌ History fetch error:", error)
			if (error instanceof Error && error.name === "AbortError") {
				console.error("🕐 Request timed out")
			}
			return []
		}
	}

	// Get real-time market trades from GraphQL
	async getMarketTrades(coinType: string, limit = 50): Promise<MarketTrade[]> {
		try {
			const query = `
                query GetMarketTrades($coinType: String!, $limit: Int!) {
                    marketTrades(
                        page: 1, 
                        pageSize: $limit, 
                        sortBy: { field: time, direction: DESC },
                        filters: { coinType: $coinType }
                    ) {
                        trades {
                            time
                            type
                            price
                            volume
                            trader
                            kind
                            quoteAmount
                            coinAmount
                            digest
                        }
                        total
                    }
                }
            `

			const response = await fetch(MEMEZ_GRAPHQL_URL, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					query,
					variables: {
						coinType,
						limit,
					},
				}),
			})

			if (!response.ok) {
				throw new Error(`GraphQL request failed: ${response.status}`)
			}

			const { data } = await response.json()
			return data?.marketTrades?.trades || []
		} catch (error) {
			console.error("Market trades fetch error:", error)
			return []
		}
	}
}

export const datafeedService = new DatafeedService()
