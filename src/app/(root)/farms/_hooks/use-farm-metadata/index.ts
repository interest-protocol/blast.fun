import { useEffect, useState } from "react"

import { interestProtocolApi, CoinMetadata } from "@/lib/interest-protocol-api"

export const useFarmMetadata = (stakeCoinType: string) => {
	const [metadata, setMetadata] = useState<CoinMetadata | null>(null)

	useEffect(() => {
		interestProtocolApi
			.getCoinMetadata(stakeCoinType)
			.then(setMetadata)
			.catch((err) => console.error("Failed to fetch metadata:", err))
	}, [stakeCoinType])

	const tokenSymbol = metadata?.symbol || stakeCoinType.split("::").pop() || "UNKNOWN"
	const tokenName = metadata?.name || tokenSymbol

	return { metadata, tokenSymbol, tokenName }
}
