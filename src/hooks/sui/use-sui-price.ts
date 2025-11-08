import { useState, useEffect } from "react"

interface SuiPrice {
	usd: number
	loading: boolean
	error: string | null
	lastUpdated: Date | null
}

export function useSuiPrice(refreshInterval = 5 * 60 * 1000) {
	const [price, setPrice] = useState<SuiPrice>({
		usd: 0,
		loading: true,
		error: null,
		lastUpdated: null,
	})

	useEffect(() => {
		if (typeof window === 'undefined') {
			return
		}

		const fetchPrice = async () => {
			try {
				const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=sui&vs_currencies=usd")

				if (!response.ok) {
					throw new Error("Failed to fetch SUI price")
				}

				const data = await response.json()
				setPrice({
					usd: data.sui.usd,
					loading: false,
					error: null,
					lastUpdated: new Date(),
				})
			} catch (error) {
				console.error("Error fetching SUI price:", error)
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
