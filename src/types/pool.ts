export type NexaTokenPool = Record<string, number> & {
    _id: string;
    pool: string;
    amountAAdded: number;
    amountAClaimed: number;
    amountARemoved: number;
    amountBAdded: number;
    amountBClaimed: number;
    amountBRemoved: number;
    platform: string;
    swapCount: number;
    coinA: string;
    coinB: string;
    liqA: number;
    liqB: number;
    liqUsd: number;
    price: number;
};
