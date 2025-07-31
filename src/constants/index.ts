import type { SiteConfig } from "@/types/app"

export const BASE_DOMAIN = (() => {
    switch (process.env.NEXT_PUBLIC_VERCEL_ENV) {
        case "production":
            return "https://xterm.fun";
        case "preview":
            return "https://staging.xterm.fun";
        default:
            return "http://localhost:3000";
    }
})();

export const siteConfig: SiteConfig = {
    name: 'xTerminal Launchpad',
    description: 'Launch, trade and explore everything memecoins on xTerminal.',
    url: 'https://xterm.fun',
    image: `${BASE_DOMAIN}/logo/xterm-bg.png`,
    links: {
        twitter: "https://twitter.com/xpumpfun"
    }
}

// misc
export const DEFAULT_TOKEN_DECIMALS = 9

export const TOTAL_POOL_SUPPLY = 1_000_000_000n * 10n ** 9n // 1 billion * 10^9 (for 9 decimals)
export const VIRTUAL_LIQUIDITY = 500 * 10 ** 9 // 500 * 10^9 (for 9 decimals)
export const TARGET_QUOTE_LIQUIDITY = 5_000 * 10 ** 9 // 5,000 * 10^9 (for 9 decimals)

export const COIN_CONVENTION_BLACKLIST = ["SUI", "ETH", "USDC", "USDT", "SOL", "BNB", "WBNB", "WETH", "BTC", "WBTC"]