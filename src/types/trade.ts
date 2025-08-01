import type { CoinsDataType } from "./pool";

export type PastSpotTradeType = {
    user: string;
    digest: string;
    timestampMs: number;
    platform: string;
    agg: string;
    coinIn: string;
    coinOut: string;
    amountIn: number;
    amountOut: number;
    priceIn: number;
    priceOut: number;
    isArb: boolean;
    amountToSell: number;
    pnl: number;
    exchanges: {
        platform: string;
        coinIn: string;
        coinOut: string;
        amountIn: number;
        amountOut: number;
        fees: number;
        pool: string;
    }[];
    entryPrice: number;
    invested: number;
    soldIn: number;
    volume: number;
    coinInMetadata: CoinsDataType;
    coinOutMetadata: CoinsDataType;
};
