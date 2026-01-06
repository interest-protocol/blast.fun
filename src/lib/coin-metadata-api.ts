export interface CoinMetadata {
    id: string
    decimals: number
    name: string
    symbol: string
    description: string
    iconUrl: string
    type: string
}

interface CoinMetadataApiOptions {
    network?: "mainnet" | "testnet"
    chain?: "sui" | "movement"
}

class CoinMetadataApi {
    private baseUrl = "https://coin-metadata-api-production.up.railway.app/api/v1"

    async getCoinMetadata(
        coinType: string,
        options: CoinMetadataApiOptions = {}
    ): Promise<CoinMetadata | null> {
        try {
            const response = await fetch(
                `${this.baseUrl}/fetch-coins?coinTypes=${encodeURIComponent(coinType)}`,
                {
                    headers: {
                        "Accept": "application/json"
                    }
                }
            )

            if (!response.ok) {
                console.error(`Metadata API error: ${response.status} ${response.statusText}`)
                return null
            }

            const data = await response.json() as CoinMetadata[]
            // @dev: API returns array, get first matching result
            return data.length > 0 ? data[0] : null
        } catch (error) {
            console.error("Failed to fetch coin metadata from Metadata API:", error)
            return null
        }
    }

    async searchCoins(
        search: string,
        options: CoinMetadataApiOptions = {}
    ): Promise<CoinMetadata[]> {
        try {
            const response = await fetch(
                `${this.baseUrl}/fetch-coins?search=${encodeURIComponent(search)}`,
                {
                    headers: {
                        "Accept": "application/json"
                    }
                }
            )

            if (!response.ok) {
                console.error(`Metadata API error: ${response.status} ${response.statusText}`)
                return []
            }

            return await response.json() as CoinMetadata[]
        } catch (error) {
            console.error("Failed to search coins from Metadata API:", error)
            return []
        }
    }

    async getBatchCoinMetadata(
        coinTypes: string[],
        options: CoinMetadataApiOptions = {}
    ): Promise<CoinMetadata[]> {
        try {
            const response = await fetch(
                `${this.baseUrl}/fetch-coins?coinTypes=${coinTypes.map(ct => encodeURIComponent(ct)).join(",")}`,
                {
                    headers: {
                        "Accept": "application/json"
                    }
                }
            )

            if (!response.ok) {
                console.error(`Metadata API error: ${response.status} ${response.statusText}`)
                return []
            }

            return await response.json() as CoinMetadata[]
        } catch (error) {
            console.error("Failed to fetch batch coin metadata from Metadata API:", error)
            return []
        }
    }
}

export const coinMetadataApi = new CoinMetadataApi()
