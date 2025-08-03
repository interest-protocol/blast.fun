import type { Socket } from 'socket.io-client'
import { io } from 'socket.io-client'
import type { TradeData } from '@/types/trade'

const URL = 'https://socket.insidex.trade'

type SubscriptionCallback = ((price: number) => void) | ((trade: TradeData) => void)

class NexaSocket {
	private socket: Socket | null = null
	private isConnecting = false
	private activeSubscriptions = new Map<string, Set<SubscriptionCallback>>()

	constructor() {
		this.connect()
	}

	private connect() {
		if (this.socket || this.isConnecting) {
			console.log('Socket already exists or is connecting')
			return
		}

		this.isConnecting = true

		this.socket = io(URL, {
			reconnection: true,
			reconnectionDelay: 1000,
			reconnectionDelayMax: 5000,
			reconnectionAttempts: 5
		})

		this.socket.on('connect', () => {
			this.isConnecting = false
			this.resubscribeAll()
		})

		this.socket.on('disconnect', (reason) => {
			console.log('Socket disconnected:', reason)
		})
	}

	private resubscribeAll() {
		if (!this.socket?.connected) return

		// resubscribe to all active subscriptions
		for (const [key, callbacks] of this.activeSubscriptions.entries()) {
			if (key.startsWith('price-') && callbacks.size > 0) {
				const [, pool, direction] = key.split('-')
				this.socket.emit('subscribe-price', { pool, direction })
			} else if (key.startsWith('trades-') && callbacks.size > 0) {
				const coin = key.replace('trades-', '')
				this.socket.emit('subscribe-trades', { coin })
			}
		}
	}

	public disconnect() {
		if (this.socket) {
			this.socket.disconnect()
			this.socket = null
			this.isConnecting = false
			this.activeSubscriptions.clear()
		}
	}

	public subscribeToTokenPrice(
		pool: string,
		direction: string,
		callback: (price: number) => void
	): () => void {
		const key = `price-${pool}-${direction}`

		if (!this.activeSubscriptions.has(key)) {
			this.activeSubscriptions.set(key, new Set())

			if (this.socket?.connected) {
				this.socket.emit('subscribe-price', { pool, direction })
			}

			this.socket?.on(key, (data: { price: number; suiPrice: number; coinPrice: number }) => {
				const callbacks = this.activeSubscriptions.get(key)
				if (callbacks) {
					const price = data.coinPrice

					callbacks.forEach(cb => {
						try {
							cb(price)
						} catch (error) {
							console.error('Price callback error:', error)
						}
					})
				}
			})
		} else {
			console.log(`Adding additional callback for price: ${pool}-${direction}`)
		}

		this.activeSubscriptions.get(key)!.add(callback)

		return () => {
			const callbacks = this.activeSubscriptions.get(key)
			if (callbacks) {
				callbacks.delete(callback)

				// if no more callbacks, unsubscribe
				if (callbacks.size === 0) {
					this.activeSubscriptions.delete(key)

					if (this.socket) {
						this.socket.emit('unsubscribe-price', { pool, direction })
						this.socket.off(key)
					}
				}
			}
		}
	}

	public subscribeToCoinTrades(
		coin: string,
		callback: (trade: TradeData) => void
	): () => void {
		const key = `trades-${coin}`

		if (!this.activeSubscriptions.has(key)) {
			this.activeSubscriptions.set(key, new Set())

			if (this.socket?.connected) {
				this.socket.emit('subscribe-trades', { coin })
			}

			this.socket?.on(key, (trade: TradeData) => {
				const callbacks = this.activeSubscriptions.get(key)
				if (callbacks) {
					callbacks.forEach(cb => {
						try {
							cb(trade)
						} catch (error) {
							console.error('Trade callback error:', error)
						}
					})
				}
			})
		} else {
			console.log(`Adding additional callback for trades: ${coin}`)
		}

		this.activeSubscriptions.get(key)!.add(callback)

		return () => {
			const callbacks = this.activeSubscriptions.get(key)
			if (callbacks) {
				callbacks.delete(callback)

				// if no more callbacks, unsubscribe
				if (callbacks.size === 0) {
					this.activeSubscriptions.delete(key)

					if (this.socket) {
						this.socket.emit('unsubscribe-trades', { coin })
						this.socket.off(key)
					}
				}
			}
		}
	}
}

let _instance: NexaSocket | null = null
const getNexaSocket = () => {
	if (!_instance) {
		_instance = new NexaSocket()
	}

	return _instance
}

const nexaSocket = getNexaSocket()
export default nexaSocket

if (typeof window !== 'undefined') {
	window.addEventListener('beforeunload', () => {
		nexaSocket.disconnect()
	})
}