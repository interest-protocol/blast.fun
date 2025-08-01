import { TradeData } from "@/types/trade"
import type { Socket } from "socket.io-client"
import { io } from "socket.io-client"

const URL = "https://socket.insidex.trade"

export type TradeUpdateCallback = (trade: TradeData) => void

class TradesFeedSocketConnection {
	private socket: Socket | null = null
	private tradeCallbacks: Map<string, Set<TradeUpdateCallback>> = new Map()
	private reconnectAttempts = 0
	private maxReconnectAttempts = 10
	private isIntentionalDisconnect = false
	private connectionTimeout: NodeJS.Timeout | null = null

	constructor() {
		this.connect()
	}

	private connect() {
		if (this.socket?.connected) return

		this.socket = io(URL, {
			reconnection: true,
			reconnectionDelay: 1000,
			reconnectionDelayMax: 5000,
			reconnectionAttempts: this.maxReconnectAttempts,
			timeout: 20000,
			transports: ['websocket', 'polling'],
		})

		this.connectionTimeout = setTimeout(() => {
			if (!this.socket?.connected) {
				this.socket?.disconnect()
				this.handleReconnect()
			}
		}, 30000)

		this.socket.on("connect", () => {
			this.reconnectAttempts = 0

			if (this.connectionTimeout) {
				clearTimeout(this.connectionTimeout)
				this.connectionTimeout = null
			}

			// resubscribe to all coins
			this.resubscribeAll()
		})

		this.socket.on("disconnect", (reason) => {
			if (!this.isIntentionalDisconnect && reason !== "io client disconnect") {
				this.handleReconnect()
			}
		})

		this.socket.on("connect_error", (error) => {
			console.error("trades-feed connection error:", error.message)
		})

		this.socket.on("error", (error) => {
			console.error("trades-feed socket error:", error)
		})
	}

	private handleReconnect() {
		if (this.isIntentionalDisconnect) return

		this.reconnectAttempts++
		if (this.reconnectAttempts <= this.maxReconnectAttempts) {
			const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 10000)
			console.log(`Reconnecting to trades-feed in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
			setTimeout(() => this.connect(), delay)
		} else {
			console.error("Max trades-feed reconnection attempts reached")
		}
	}

	public subscribeToCoinTrades(
		coin: string,
		callback: TradeUpdateCallback
	): () => void {
		if (!this.tradeCallbacks.has(coin)) {
			this.tradeCallbacks.set(coin, new Set())

			this.socket?.emit("subscribe-trades", { coin })

			this.socket?.on(`trades-${coin}`, (trade: TradeData) => {
				const callbacks = this.tradeCallbacks.get(coin)
				if (callbacks) {
					callbacks.forEach(cb => {
						try {
							cb(trade)
						} catch (error) {
							console.error("trade subscription callback error:", error)
						}
					})
				}
			})
		}

		this.tradeCallbacks.get(coin)!.add(callback)

		// return unsubscribe function
		return () => {
			const callbacks = this.tradeCallbacks.get(coin)
			if (callbacks) {
				callbacks.delete(callback)
				if (callbacks.size === 0) {
					this.tradeCallbacks.delete(coin)
					this.unsubscribeFromCoinTrades(coin)
				}
			}
		}
	}

	private unsubscribeFromCoinTrades(coin: string) {
		this.socket?.emit("unsubscribe-trades", { coin })
		this.socket?.off(`trades-${coin}`)
	}

	private resubscribeAll() {
		for (const coin of this.tradeCallbacks.keys()) {
			this.socket?.emit("subscribe-trades", { coin })
		}
	}

	public disconnect() {
		this.isIntentionalDisconnect = true

		if (this.connectionTimeout) {
			clearTimeout(this.connectionTimeout)
			this.connectionTimeout = null
		}

		for (const coin of this.tradeCallbacks.keys()) {
			this.unsubscribeFromCoinTrades(coin)
		}

		this.tradeCallbacks.clear()

		if (this.socket) {
			this.socket.removeAllListeners()
			this.socket.disconnect()
			this.socket = null
		}
	}

	public isConnected(): boolean {
		return this.socket?.connected ?? false
	}
}

let instance: TradesFeedSocketConnection | null = null

export function getTradesFeedSocket(): TradesFeedSocketConnection {
	if (!instance) {
		instance = new TradesFeedSocketConnection()
	}

	return instance
}

export function closeTradesFeedSocket(): void {
	if (instance) {
		instance.disconnect()
		instance = null
	}
}

// cleanup
if (typeof window !== "undefined") {
	window.addEventListener("beforeunload", () => {
		closeTradesFeedSocket()
	})

	window.addEventListener("unload", () => {
		closeTradesFeedSocket()
	})
}