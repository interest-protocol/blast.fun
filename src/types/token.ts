import { NexaTokenPool } from "./pool";

export interface TokenMetadata {
    name: string;
    symbol: string;
    description: string;
    icon_url: string;
    decimals: number;
    supply: number;
    Website?: string;
    X?: string;
    Telegram?: string;
    Discord?: string;
}

export interface TokenCreator {
    address: string;
    launchCount: number;
    trustedFollowers: string;
    followers: string;
    twitterHandle?: string | null;
    twitterId?: string | null;
    hideIdentity?: boolean;
}

export interface TokenMarketData {
    marketCap: number;
    holdersCount: number;
    volume24h: number;
    liquidity: number;
    price: number;
    coinPrice: number;
    bondingProgress: number;
    circulating?: number;
    circulatingUpdatedAt?: number;

    top10Holdings?: number;
    devHoldings?: number;

    tradeCount?: number;
    buyTradeCount?: number;
    sellTradeCount?: number;

    price5MinsAgo?: number;
    price1HrAgo?: number;
    price4HrAgo?: number;
    price1DayAgo?: number;
}

export interface TokenPoolData {
    poolId: string;
    coinType: string;
    bondingCurve: number;
    coinBalance: string;
    virtualLiquidity: string;
    targetQuoteLiquidity: string;
    quoteBalance: string;
    migrated: boolean;
    curve: string;
    coinIpxTreasuryCap: string;
    canMigrate: boolean;
    canonical: boolean;
    migrationWitness: string | null;
    mostLiquidPoolId?: string;
    burnTax?: number;
    isProtected?: boolean;
    publicKey?: string;
    innerState?: string;
}

export interface Token {
	id: string
	coinType: string

	name: string
	symbol: string
	logo?: string
	decimals: number

	price: number
	priceChange1d: number
	priceChange6h: number
	priceChange4h: number
	priceChange1h: number
	priceChange30m: number

	marketCap: number
	liquidity: number
	circulatingSupply: number
	totalSupply: number

	tx24h: number
	txBuy24h: number
	txSell24h: number

	volume24h: number
	volume6h: number
	volume4h: number
	volume1h: number
	volume30m: number

	holders: number
	top10HolderPercent: number
	devHoldingPercent: number

	createdAt: string
	verified: boolean
	rank: number

	iconUrl?: string
	chart1dUrl?: string

	metadata?: TokenMetadata
	creator?: TokenCreator
	market?: TokenMarketData
	pool?: TokenPoolData
	treasuryCap?: string
	poolId?: string
	isProtected?: boolean
	lastTradeAt?: string
	nsfw?: boolean
}


export interface NexaToken {
    id: string;
    coinType: string;
    createdAt: number;
    decimals: number;
    description: string;
    dev: string;
    isHoneypot: boolean;
    name: string;
    supply: number;
    symbol: string;
    treasuryCap: string;
    treasuryCapOwner: {
        ObjectOwner: string;
    };
    dexPaid: boolean;
    iconUrl: string;
    circulating: number | null;
    coinDev: string;
    coinSupply: number;
    coinDevHoldings: number;
    price: number;
    suiPrice: number;
    marketCap: number;
    sellVolume: number;
    pools: ReadonlyArray<NexaTokenPool>;
    sniperHoldings: number;
    bundleHoldings: number;
    sniperHoldingsPercent: number;
    bundleHoldingsPercent: 0.0002659072293597235;
    telegram: string;
    website: string;
    twitter: string;
    isProtected: null;
    poolId: string;
    creatorData: {
        launchCount: number;
        followers: string;
        trustedFollowers: string;
        twitterHandle: string | null;
        twitterId: string | null;
    };
}

export interface TokenFilters {
    platforms?: string[];

    bondingProgressMin?: number;
    bondingProgressMax?: number;

    ageMin?: number;
    ageMax?: number;

    holdersCountMin?: number;
    holdersCountMax?: number;
    top10HoldingsMin?: number;
    top10HoldingsMax?: number;
    devHoldingsMin?: number;
    devHoldingsMax?: number;

    marketCapMin?: number;
    marketCapMax?: number;
    liquidityMin?: number;
    liquidityMax?: number;
    volumeMin?: number;
    volumeMax?: number;

    tradeCountMin?: number;
    tradeCountMax?: number;
    buyTradeCountMin?: number;
    buyTradeCountMax?: number;
    sellTradeCountMin?: number;
    sellTradeCountMax?: number;

    hasWebsite?: boolean;
    hasTwitter?: boolean;
    hasTelegram?: boolean;
    hasDiscord?: boolean;

    tabType?: "newly-created" | "about-to-bond" | "bonded";
}

export type TokenSortOption =
    | "marketCap"
    | "date"
    | "volume"
    | "holders"
    | "bondingProgress"
    | "lastTrade"
    | "liquidity"
    | "devHoldings"
    | "top10Holdings";

export interface TokenListSettings {
    sortBy: TokenSortOption;
    filters: TokenFilters;
}

export interface TokensResponse {
    tokens: Token[];
    totalCount: number;
    hasMore: boolean;
    nextCursor?: string;
}
