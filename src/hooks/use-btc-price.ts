import { useState, useEffect } from "react"

interface BtcPrice {
	usd: number
	loading: boolean
	error: string | null
	lastUpdated: Date | null
}

export function useBtcPrice(refreshInterval = 5 * 60 * 1000) {
	const [price, setPrice] = useState<BtcPrice>({
		usd: 0,
		loading: true,
		error: null,
		lastUpdated: null,
	})

	useEffect(() => {
		// @dev: Only fetch prices on the client side
		if (typeof window === 'undefined') {
			return
		}

		const fetchPrice = async () => {
			try {
				const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd")

				if (!response.ok) {
					throw new Error("Failed to fetch BTC price")
				}

				const data = await response.json()
				setPrice({
					usd: data.bitcoin.usd,
					loading: false,
					error: null,
					lastUpdated: new Date(),
				})
			} catch (error) {
				console.error("Error fetching BTC price:", error)
				setPrice((prev) => ({
					...prev,
					loading: false,
					error: error instanceof Error ? error.message : "Unknown error",
				}))
			}
		}

		fetchPrice()

		const intervalId = setInterval(fetchPrice, refreshInterval)
		return () => clearInterval(intervalId)
	}, [refreshInterval])

	return price
}
