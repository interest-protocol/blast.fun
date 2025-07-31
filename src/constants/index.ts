import type { SiteConfig } from "@/types/app"

export const BASE_DOMAIN = (() => {
    switch (process.env.NEXT_PUBLIC_VERCEL_ENV) {
        case "production":
            return "https://xctasy.fun";
        case "preview":
            return "https://staging.xctasy.fun";
        default:
            return "http://localhost:3000";
    }
})();

export const siteConfig: SiteConfig = {
    name: 'XCTASY.FUN',
    description: 'Launch, trade and explore everything memecoins on xctasy.fun',
    url: 'https://xctasy.fun',
    image: `${BASE_DOMAIN}/logo/xctasy-bg.png`,
    links: {
        twitter: "https://twitter.com/xctasyfun"
    }
}

// misc
export const DEFAULT_TOKEN_DECIMALS = 9

export const TOTAL_POOL_SUPPLY = 1_000_000_000n * 10n ** 9n // 1 billion * 10^9 (for 9 decimals)
export const VIRTUAL_LIQUIDITY = 500 * 10 ** 9 // 500 * 10^9 (for 9 decimals)
export const TARGET_QUOTE_LIQUIDITY = 5_000 * 10 ** 9 // 5,000 * 10^9 (for 9 decimals)

export const COIN_CONVENTION_BLACKLIST = ["SUI", "ETH", "USDC", "USDT", "SOL", "BNB", "WBNB", "WETH", "BTC", "WBTC"]