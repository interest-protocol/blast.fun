import type { SiteConfig } from "@/types/app"

export const siteConfig: SiteConfig = {
    name: 'xPump',
    description: 'Launch, trade and explore everything memecoins on xPump.',
    url: 'https://xpump.fun',
    image: "/logo/xpump-logo.png",
    links: {
        twitter: "https://twitter.com/xpumpfun"
    }
}

export const DEFAULT_TOKEN_DECIMALS = 9

export const TOTAL_POOL_SUPPLY = 1_000_000_000n * 10n ** 9n // 1 billion * 10^9 (for 9 decimals)
export const VIRTUAL_LIQUIDITY = 500 * 10 ** 9 // 500 * 10^9 (for 9 decimals)
export const TARGET_QUOTE_LIQUIDITY = 5_000 * 10 ** 9 // 5,000 * 10^9 (for 9 decimals)

export const COIN_CONVENTION_BLACKLIST = ["SUI", "ETH", "USDC", "USDT", "SOL", "BNB", "WBNB", "WETH", "BTC", "WBTC"]

export const BASE_DOMAIN = (() => {
    switch (process.env.NEXT_PUBLIC_VERCEL_ENV) {
        case "production":
            return "https://xpump.fun";
        case "preview":
            return "https://staging.xpump.fun";
        default:
            return "http://localhost:3000";
    }
})();