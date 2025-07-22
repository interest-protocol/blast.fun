"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchCoinOHLCV } from "@/lib/datafeed/fetch-coin-ohlcv"

interface UseCoinOHLCVOptions {
	symbol: string
	resolution: string
	enabled?: boolean
}

export function useCoinOHLCV({ symbol, resolution, enabled = true }: UseCoinOHLCVOptions) {
	const refetchInterval = getRefetchInterval(resolution)

	return useQuery({
		queryKey: ["coin-ohlcv", symbol, resolution],
		queryFn: () => fetchCoinOHLCV(symbol, resolution),
		staleTime: refetchInterval / 2,
		refetchInterval,
		refetchIntervalInBackground: true,
		retry: 1,
		retryDelay: 5000,
		enabled,
	})
}

function getRefetchInterval(resolution: string): number {
	switch (resolution) {
		case "1":
			return 10 * 1000 // 10 seconds for 1-minute candles
		case "5":
			return 30 * 1000 // 30 seconds for 5-minute candles
		case "15":
			return 60 * 1000 // 1 minute for 15-minute candles
		case "60":
			return 2 * 60 * 1000 // 2 minutes for 1-hour candles
		case "240":
			return 5 * 60 * 1000 // 5 minutes for 4-hour candles
		default:
			return 10 * 60 * 1000 // 10 minutes for daily/weekly
	}
}