import { useEffect } from "react"
import { siteConfig } from "@/constants"

interface UseDocumentTitleOptions {
	symbol?: string
	marketCap?: number | string
	formatMarketCap?: (value: number | string) => string
}

export function useDocumentTitle(options: UseDocumentTitleOptions = {}) {
	const { symbol, marketCap, formatMarketCap } = options

	useEffect(() => {
		if (symbol && marketCap) {
			const formattedMarketCap = formatMarketCap
				? formatMarketCap(marketCap)
				: typeof marketCap === "number"
					? `$${marketCap.toLocaleString()}`
					: marketCap

			document.title = `${symbol.toUpperCase()} ${formattedMarketCap} | ${siteConfig.name}`
		} else if (symbol) {
			document.title = `${symbol.toUpperCase()} | ${siteConfig.name}`
		} else {
			document.title = siteConfig.name
		}

		return () => {
			document.title = siteConfig.name
		}
	}, [symbol, marketCap, formatMarketCap])
}
