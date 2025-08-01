export type TradeData = {
    _id: any
    user: string
    digest: string
    timestampMs: number
    coinIn: string
    coinOut: string
    amountIn: number
    amountOut: number
    priceIn: number
    priceOut: number
    platform: string
    volume: number
    operationType: string
    coinInMetadata?: any
    coinOutMetadata?: any
}