export type TickerItem = {
    id: string
    coinType: string
    name: string
    symbol: string
    kind: "buy" | "sell"
    amount: number
    trader: string
    timestamp: number
}