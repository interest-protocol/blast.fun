import { useEffect, useState } from "react"

import { coinMetadataApi, CoinMetadata } from "@/lib/coin-metadata-api"

export const useFarmMetadata = (stakeCoinType: string) => {
	const [metadata, setMetadata] = useState<CoinMetadata | null>(null)

	useEffect(() => {
		coinMetadataApi
			.getCoinMetadata(stakeCoinType)
			.then(setMetadata)
			.catch((err) => console.error("Failed to fetch metadata:", err))
	}, [stakeCoinType])

	const tokenSymbol = metadata?.symbol || stakeCoinType.split("::").pop() || "UNKNOWN"
	const tokenName = metadata?.name || tokenSymbol

	return { metadata, tokenSymbol, tokenName }
}
