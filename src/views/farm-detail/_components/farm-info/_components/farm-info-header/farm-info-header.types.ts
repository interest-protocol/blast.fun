export interface FarmInfoHeaderProps {
    tokenName: string
    tokenSymbol: string
    metadata: {
        iconUrl?: string
    } | null;
    tvlAmount: number
    tvlUsd: number
    stakeTokenPrice: number
}