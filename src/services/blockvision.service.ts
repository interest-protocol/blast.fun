import type {
	AccountCoinsResponse,
	AccountCoinsResult,
	CoinInfo,
	CoinDetails,
	CoinDetailsResponse,
	ServiceResponse,
	WalletCoin,
} from "@/types/blockvision"

class BlockVisionService {
	private readonly accountBaseUrl = "https://api.blockvision.org/v2/sui/account"
	private readonly coinBaseUrl = "https://api.blockvision.org/v2/sui/coin"
	private readonly apiKey = process.env.BLOCKVISION_API_KEY || process.env.SUIVISION_API_KEY || ""
	private readonly timeout = 30000 // 30 seconds
	private readonly retryAttempts = 3
	private readonly retryDelay = 2000 // 2 seconds

	/**
	 * Get account coins (fungible tokens) for a given SUI address
	 * This method is optimized for wallet balance fetching
	 */
	async getAccountCoins(account: string): Promise<ServiceResponse<WalletCoin[]>> {
		try {
			console.log(`💰 Fetching coins for account: ${account}`)

			const response = await this.makeRequest<AccountCoinsResponse>(
				"GET",
				"/coins",
				{ account },
				this.accountBaseUrl
			)

			if (response.code !== 200) {
				return {
					success: false,
					error: `API error: ${response.message}`,
				}
			}

			const result = response.result
			
			// Filter out zero balance coins and scam coins
			const validCoins = result.coins.filter((coin: CoinInfo) => {
				// Check multiple conditions for zero balance
				if (!coin.balance || coin.scam) return false
				
				// Convert balance string to number and check if it's greater than 0
				try {
					const balanceNum = BigInt(coin.balance)
					return balanceNum > BigInt(0)
				} catch {
					// If BigInt fails, the balance might be invalid
					return false
				}
			})

			// Transform to wallet coin format
			const walletCoins: WalletCoin[] = validCoins.map((coin) => {
				let processedUsdValue = coin.usdValue || "0"
				
				// Handle scientific notation in USD values
				if (processedUsdValue.includes("e")) {
					const numValue = Number(processedUsdValue)
					if (numValue < 0.01) {
						processedUsdValue = "0"
					} else {
						processedUsdValue = numValue.toFixed(2)
					}
				}

				return {
					coinType: coin.coinType,
					balance: coin.balance,
					decimals: coin.decimals || 9,
					symbol: coin.symbol || "",
					name: coin.name || "",
					iconUrl: coin.logo,
					price: coin.price ? parseFloat(coin.price) : undefined,
					value: processedUsdValue ? parseFloat(processedUsdValue) : undefined,
					verified: coin.verified,
					scam: coin.scam,
				}
			})

			console.log(
				`✅ Account coins fetched: ${walletCoins.length} valid coins, USD value: $${result.usdValue}`
			)

			return {
				success: true,
				data: walletCoins,
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Unknown error"
			console.error(`❌ Failed to fetch account coins for ${account}:`, errorMessage)

			return {
				success: false,
				error: errorMessage,
			}
		}
	}

	/**
	 * Get details for a specific coin type
	 */
	async getCoinDetails(coinType: string): Promise<ServiceResponse<CoinDetails>> {
		try {
			console.log(`🪙 Fetching coin details for: ${coinType}`)

			const response = await this.makeRequest<CoinDetailsResponse>(
				"GET",
				"/detail",
				{ coinType },
				this.coinBaseUrl
			)

			if (response.code !== 200) {
				return {
					success: false,
					error: `API error: ${response.message}`,
				}
			}

			console.log(
				`✅ Coin details fetched: ${response.result.name} (${response.result.symbol})`
			)

			return {
				success: true,
				data: response.result,
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Unknown error"
			console.error(`❌ Failed to fetch coin details for ${coinType}:`, errorMessage)

			return {
				success: false,
				error: errorMessage,
			}
		}
	}

	/**
	 * Make HTTP request with retry logic
	 */
	private async makeRequest<T>(
		method: "GET" | "POST",
		endpoint: string,
		params: Record<string, any>,
		baseUrl: string
	): Promise<T> {
		let lastError: Error

		for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
			try {
				const url = new URL(`${baseUrl}${endpoint}`)
				
				if (method === "GET") {
					Object.keys(params).forEach(key => {
						url.searchParams.append(key, params[key])
					})
				}

				const config: RequestInit = {
					method,
					headers: {
						"accept": "application/json",
						"x-api-key": this.apiKey,
						...(method === "POST" && { "Content-Type": "application/json" }),
					},
					...(method === "POST" && { body: JSON.stringify(params) }),
				}

				const controller = new AbortController()
				const timeoutId = setTimeout(() => controller.abort(), this.timeout)

				try {
					const response = await fetch(url.toString(), {
						...config,
						signal: controller.signal,
					})
					clearTimeout(timeoutId)

					if (!response.ok) {
						throw new Error(`HTTP error! status: ${response.status}`)
					}

					const data = await response.json()
					return data as T
				} catch (error) {
					clearTimeout(timeoutId)
					throw error
				}
			} catch (error) {
				lastError = error instanceof Error ? error : new Error("Unknown error")

				if (attempt < this.retryAttempts) {
					console.warn(
						`🔄 Request failed, retrying ${attempt}/${this.retryAttempts}: ${lastError.message}`
					)
					await new Promise(resolve => 
						setTimeout(resolve, this.retryDelay * attempt)
					)
				}
			}
		}

		throw lastError!
	}

	/**
	 * Health check for the BlockVision API
	 */
	async healthCheck(): Promise<boolean> {
		try {
			// Use SUI coin type for health check
			const suiCoinType = "0x2::sui::SUI"
			const response = await this.getCoinDetails(suiCoinType)
			return response.success
		} catch (error) {
			console.error("BlockVision API health check failed:", error)
			return false
		}
	}

	/**
	 * Get API configuration status
	 */
	getStatus() {
		return {
			apiKey: this.apiKey ? "Configured" : "Not configured",
			accountBaseUrl: this.accountBaseUrl,
			coinBaseUrl: this.coinBaseUrl,
			timeout: this.timeout,
			retryAttempts: this.retryAttempts,
		}
	}
}

// Export singleton instance for server-side use
export const blockVisionService = new BlockVisionService()

// Export class for client-side instantiation if needed
export { BlockVisionService }