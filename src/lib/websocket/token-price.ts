import type { TradeData } from "@/types/trade"

const NOODLES_WS_URL = "wss://ws.noodles.fi/ws/coin-update"
const PING_INTERVAL_MS = 30000

type PriceCallback = (data: { price: number }) => void
type TradeCallback = (trade: TradeData) => void

function noodlesTradeToTradeData(raw: {
	action: string
	amount_in: number
	amount_out: number
	from_coin_ident: string
	to_coin_ident: string
	price: number
	sender: string
	timestamp: number
	tx_digest: string
	usd_value: number
	protocol?: string
}): TradeData {
	const isBuy = raw.action === "buy"
	return {
		_id: raw.tx_digest + "-" + raw.timestamp,
		user: raw.sender,
		digest: raw.tx_digest,
		timestampMs: raw.timestamp,
		coinIn: raw.from_coin_ident,
		coinOut: raw.to_coin_ident,
		amountIn: raw.amount_in,
		amountOut: raw.amount_out,
		priceIn: raw.price,
		priceOut: raw.price,
		platform: raw.protocol ?? "",
		volume: raw.usd_value,
		operationType: raw.action,
	}
}

class TokenPriceSocket {
	private ws: WebSocket | null = null
	private pingTimer: ReturnType<typeof setInterval> | null = null
	private priceCallbacks = new Map<string, PriceCallback>()
	private tradeCallbacks = new Map<string, TradeCallback>()
	private priceSubscriptions = new Set<string>()
	private tradeSubscriptions = new Set<string>()
	private reconnectAttempts = 0
	private readonly maxReconnectAttempts = 5

	private connect() {
		if (this.ws?.readyState === WebSocket.OPEN) return
		this.ws = new WebSocket(NOODLES_WS_URL)

		this.ws.onopen = () => {
			this.reconnectAttempts = 0
			this.startPing()
			this.resubscribeAll()
		}

		this.ws.onmessage = (event) => {
			try {
				const msg = JSON.parse(event.data as string)
				if (msg.type === "data" && msg.data) {
					if (msg.room === "COIN_UPDATES" && msg.data.price != null) {
						const coin = typeof msg.data.coin === "string" ? msg.data.coin : msg.data.coin?.coin_ident
						if (coin) {
							const cb = this.priceCallbacks.get(coin)
							if (cb) cb({ price: Number(msg.data.price) })
						}
					} else if (msg.room === "TRADES" && Array.isArray(msg.data)) {
						const channel = msg.channel as string | undefined
						const coin = channel?.replace(/^TRADES-/, "")
						if (coin) {
							const cb = this.tradeCallbacks.get(coin)
							if (cb) {
								for (const t of msg.data) {
									cb(noodlesTradeToTradeData(t))
								}
							}
						}
					}
				}
			} catch {
				// ignore parse errors
			}
		}

		this.ws.onclose = () => {
			this.stopPing()
			if (this.priceSubscriptions.size > 0 || this.tradeSubscriptions.size > 0) {
				if (this.reconnectAttempts < this.maxReconnectAttempts) {
					this.reconnectAttempts++
					setTimeout(() => this.connect(), 2000)
				}
			}
		}

		this.ws.onerror = () => {
			// Connection errors handled in onclose
		}
	}

	private startPing() {
		this.stopPing()
		this.pingTimer = setInterval(() => {
			if (this.ws?.readyState === WebSocket.OPEN) {
				this.ws.send(JSON.stringify({ type: "ping" }))
			}
		}, PING_INTERVAL_MS)
	}

	private stopPing() {
		if (this.pingTimer) {
			clearInterval(this.pingTimer)
			this.pingTimer = null
		}
	}

	private send(msg: object) {
		if (this.ws?.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(msg))
		}
	}

	private resubscribeAll() {
		const coins = [...this.priceSubscriptions]
		if (coins.length > 0) {
			this.send({ type: "subscribe", room: "COIN_UPDATES", data: { coins } })
		}
		for (const coin of this.tradeSubscriptions) {
			this.send({ type: "subscribe", room: "TRADES", data: { coin } })
		}
	}

	public subscribeToTokenPrice(coinType: string, callback: PriceCallback) {
		const key = coinType
		this.priceCallbacks.set(key, callback)
		this.priceSubscriptions.add(key)
		this.connect()
		this.send({ type: "subscribe", room: "COIN_UPDATES", data: { coins: [key] } })
	}

	public unsubscribeFromTokenPrice(coinType: string) {
		const key = coinType
		this.priceCallbacks.delete(key)
		this.priceSubscriptions.delete(key)
		this.send({ type: "unsubscribe", room: "COIN_UPDATES", data: { coins: [key] } })
		if (this.priceSubscriptions.size === 0 && this.tradeSubscriptions.size === 0) {
			this.disconnectSocket()
		}
	}

	public subscribeToCoinTrades(coinType: string, callback: TradeCallback) {
		const key = coinType
		this.tradeCallbacks.set(key, callback)
		this.tradeSubscriptions.add(key)
		this.connect()
		this.send({ type: "subscribe", room: "TRADES", data: { coin: key } })
	}

	public unsubscribeFromCoinTrades(coinType: string) {
		const key = coinType
		this.tradeCallbacks.delete(key)
		this.tradeSubscriptions.delete(key)
		this.send({ type: "unsubscribe", room: "TRADES", data: { coin: key } })
		if (this.priceSubscriptions.size === 0 && this.tradeSubscriptions.size === 0) {
			this.disconnectSocket()
		}
	}

	public disconnectSocket() {
		this.stopPing()
		this.priceCallbacks.clear()
		this.tradeCallbacks.clear()
		this.priceSubscriptions.clear()
		this.tradeSubscriptions.clear()
		if (this.ws) {
			this.ws.close()
			this.ws = null
		}
	}
}

const tokenPriceSocket = new TokenPriceSocket()
export default tokenPriceSocket
