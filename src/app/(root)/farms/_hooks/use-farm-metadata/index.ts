import { useEffect, useState } from "react"

import { fetchCoinMetadata, type CoinMetadata } from "@/lib/coin-metadata"

export const useFarmMetadata = (stakeCoinType: string) => {
	const [metadata, setMetadata] = useState<CoinMetadata | null>(null)

	useEffect(() => {
		fetchCoinMetadata(stakeCoinType)
			.then(setMetadata)
			.catch((err) => console.error("Failed to fetch metadata:", err))
	}, [stakeCoinType])

	const tokenSymbol = metadata?.symbol || stakeCoinType.split("::").pop() || "UNKNOWN"
	const tokenName = metadata?.name || tokenSymbol

	return { metadata, tokenSymbol, tokenName }
}
