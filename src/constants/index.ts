export const DEFAULT_TOKEN_DECIMALS = 9;

export const TOTAL_POOL_SUPPLY = 1_000_000_000n * (10n ** 9n); // 1 billion * 10^9 (for 9 decimals)
export const VIRTUAL_LIQUIDITY = 500 * (10 ** 9); // 500 * 10^9 (for 9 decimals)
export const TARGET_QUOTE_LIQUIDITY = 10_000 * (10 ** 9); // 10,000 * 10^9 (for 9 decimals)

export const COIN_CONVENTION_BLACKLIST = [
    'SUI',
    'ETH',
    'USDC',
    'USDT',
    'SOL',
    'BNB',
    'WBNB',
    'WETH',
    'BTC',
    'WBTC',
];