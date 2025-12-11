interface PoolMetadata {
    icon_url: string 
    name: string
    symbol: string
}

export interface TokenInfoProps {
    metadata: PoolMetadata
    coinType: string
    refCode?: string
}
