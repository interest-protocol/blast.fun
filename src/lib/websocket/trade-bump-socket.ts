import type { Socket } from 'socket.io-client'
import { io } from 'socket.io-client'

const URL = 'https://api.memez.interestlabs.io'

export type TradeEvent = {
	coin_amount: string | number
	digest: string
	kind: 'sell' | 'buy'
	sender: string
	time: string
	// @dev: type = coinType
	type: string
	volume: number
	price?: number
	quoteType: string
	quote_amount?: string | number
}

class TradeBumpSocket {
	private socket: Socket

	constructor() {
		this.socket = io(URL, {
			transports: ['websocket'],
			reconnection: true,
			reconnectionDelay: 1000,
			reconnectionDelayMax: 5000,
			reconnectionAttempts: 5
		})
	}

	disconnectSocket() {
		this.socket.disconnect()
	}

	public subscribeToTradeEvents(callback: (trade: TradeEvent) => void) {
		this.socket.on('trade-event', callback)
	}

	public unsubscribeFromTradeEvents() {
		this.socket.off('trade-event')
	}
}

const tradeBumpSocket = new TradeBumpSocket()
export default tradeBumpSocket