export interface CoinMetadata {
	id: string
	decimals: number
	name: string
	symbol: string
	description: string
	iconUrl: string
	type: string
}

interface InterestProtocolApiOptions {
	network?: "mainnet" | "testnet"
	chain?: "sui" | "movement"
}

class InterestProtocolApi {
	private baseUrl = "https://api.interestlabs.io/v1"
	
	async getCoinMetadata(
		coinType: string,
		options: InterestProtocolApiOptions = {}
	): Promise<CoinMetadata | null> {
		const { network = "mainnet", chain = "sui" } = options
		
		try {
			const response = await fetch(
				`${this.baseUrl}/coins/${network}/metadatas?coinTypes=${encodeURIComponent(coinType)}`,
				{
					headers: {
						"chain": chain,
						"Accept": "application/json"
					}
				}
			)
			
			if (!response.ok) {
				console.error(`Interest Protocol API error: ${response.status} ${response.statusText}`)
				return null
			}
			
			const data = await response.json() as CoinMetadata[]
			
			// @dev: API returns array, get first matching result
			return data.length > 0 ? data[0] : null
			
		} catch (error) {
			console.error("Failed to fetch coin metadata from Interest Protocol:", error)
			return null
		}
	}
	
	async searchCoins(
		search: string,
		options: InterestProtocolApiOptions = {}
	): Promise<CoinMetadata[]> {
		const { network = "mainnet", chain = "sui" } = options
		
		try {
			const response = await fetch(
				`${this.baseUrl}/coins/${network}/metadatas?search=${encodeURIComponent(search)}`,
				{
					headers: {
						"chain": chain,
						"Accept": "application/json"
					}
				}
			)
			
			if (!response.ok) {
				console.error(`Interest Protocol API error: ${response.status} ${response.statusText}`)
				return []
			}
			
			return await response.json() as CoinMetadata[]
			
		} catch (error) {
			console.error("Failed to search coins from Interest Protocol:", error)
			return []
		}
	}
	
	async getBatchCoinMetadata(
		coinTypes: string[],
		options: InterestProtocolApiOptions = {}
	): Promise<CoinMetadata[]> {
		const { network = "mainnet", chain = "sui" } = options
		
		try {
			const response = await fetch(
				`${this.baseUrl}/coins/${network}/metadatas?coinTypes=${coinTypes.map(ct => encodeURIComponent(ct)).join(",")}`,
				{
					headers: {
						"chain": chain,
						"Accept": "application/json"
					}
				}
			)
			
			if (!response.ok) {
				console.error(`Interest Protocol API error: ${response.status} ${response.statusText}`)
				return []
			}
			
			return await response.json() as CoinMetadata[]
			
		} catch (error) {
			console.error("Failed to fetch batch coin metadata from Interest Protocol:", error)
			return []
		}
	}
}

export const interestProtocolApi = new InterestProtocolApi()