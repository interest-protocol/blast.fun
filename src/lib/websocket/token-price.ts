import type { Socket } from 'socket.io-client'
import type { TradeData } from '@/types/trade'
import { io } from 'socket.io-client'

const URL = 'https://spot.api.sui-prod.bluefin.io'

class TokenPriceSocket {
	private socket: Socket
	private activeSubscriptions = new Map<string, Function>()

	constructor() {
		this.socket = io(URL, {
			path: '/price-feed-socket/insidex',
			transports: ['websocket'],
			reconnection: false,
			timeout: 10000
		})

		this.socket.on('ping', () => {
			this.socket.emit('pong')
		})
	}

	public subscribeToTokenPrice(
		pool: string,
		direction: string,
		callback: (data: { price: number; suiPrice: number }) => void
	) {
		const event = `price-${pool}-${direction}`

        // remove existing
		const existing = this.activeSubscriptions.get(event)
		if (existing) {
			this.socket.off(event, existing as any)
		}

		this.activeSubscriptions.set(event, callback)
		this.socket.emit('subscribe-price', { pool, direction })
		this.socket.on(event, callback)
	}

	public unsubscribeFromTokenPrice(pool: string, direction: string) {
		const event = `price-${pool}-${direction}`
		const callback = this.activeSubscriptions.get(event)

		if (callback) {
			this.socket.off(event, callback as any)
			this.activeSubscriptions.delete(event)
		}

		this.socket.emit('unsubscribe-price', { pool, direction })
	}

	public subscribeToCoinTrades(
		coin: string,
		callback: (trade: TradeData) => void
	) {
		const event = `trades-${coin}`

        // remove existing
		const existing = this.activeSubscriptions.get(event)
		if (existing) {
			this.socket.off(event, existing as any)
		}

		this.activeSubscriptions.set(event, callback)
		this.socket.emit('subscribe-trades', { coin })
		this.socket.on(event, callback)
	}

	public unsubscribeFromCoinTrades(coin: string) {
		const event = `trades-${coin}`
		const callback = this.activeSubscriptions.get(event)

		if (callback) {
			this.socket.off(event, callback as any)
			this.activeSubscriptions.delete(event)
		}

		this.socket.emit('unsubscribe-trades', { coin })
	}

	public disconnectSocket() {
		this.activeSubscriptions.forEach((callback, event) => {
			this.socket.off(event, callback as any)
		})

		this.activeSubscriptions.clear()
		this.socket.disconnect()
	}
}

const tokenPriceSocket = new TokenPriceSocket()
export default tokenPriceSocket
