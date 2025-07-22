export interface CoinOHLCV {
	time: number
	open: string
	high: string
	low: string
	close: string
	volume: string
}

export async function fetchCoinOHLCV(
	symbol: string,
	resolution: string
): Promise<CoinOHLCV[]> {
	const response = await fetch(
		`https://datafeed-rest-production.up.railway.app/api/v1/datafeed/history?symbol=${encodeURIComponent(
			symbol
		)}&resolution=${resolution}`,
		{
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		}
	)

	if (!response.ok) {
		throw new Error(`Failed to fetch chart data: ${response.status}`)
	}

	const data = await response.json()
	return Array.isArray(data) ? data : []
}