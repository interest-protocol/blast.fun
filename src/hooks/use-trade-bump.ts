import { useEffect, useState, useCallback } from 'react'
import tradeBumpSocket, { type TradeEvent } from '@/lib/websocket/trade-bump-socket'

export function useTradeBump() {
	const [bumpOrder, setBumpOrder] = useState<string[]>([])
	const [animatingToken, setAnimatingToken] = useState<string | null>(null)

	const handleTradeEvent = useCallback((trade: TradeEvent) => {
		const coinType = trade.type
		if (!coinType) return

		setBumpOrder(prev => [coinType, ...prev.filter(t => t !== coinType)])

		setAnimatingToken(coinType)
		setTimeout(() => {
			setAnimatingToken(null)
		}, 800)
	}, [])

	useEffect(() => {
		tradeBumpSocket.subscribeToTradeEvents(handleTradeEvent)

		return () => {
			tradeBumpSocket.unsubscribeFromTradeEvents()
		}
	}, [handleTradeEvent])

	const isAnimating = useCallback((coinType: string): boolean => {
		return animatingToken === coinType
	}, [animatingToken])

	return {
		bumpOrder,
		isAnimating
	}
}