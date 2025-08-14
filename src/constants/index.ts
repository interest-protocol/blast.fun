import type { SiteConfig } from "@/types/app"

export const BASE_DOMAIN = (() => {
    switch (process.env.NEXT_PUBLIC_VERCEL_ENV) {
        case "production":
            return "https://blast.fun";
        case "preview":
            return "https://staging.blast.fun";
        default:
            return "http://localhost:3000";
    }
})();

export const siteConfig: SiteConfig = {
    name: 'BLAST.FUN',
    description: 'Launch, trade and explore everything memecoins on blast.fun',
    url: 'https://blast.fun',
    image: `${BASE_DOMAIN}/logo/blast-bg.png`,
    links: {
        twitter: "https://twitter.com/blastdotfun"
    }
}

// misc
export const DEFAULT_TOKEN_DECIMALS = 9

export const TOTAL_POOL_SUPPLY = 1_000_000_000n * 10n ** 9n // 1 billion * 10^9 (for 9 decimals)
export const VIRTUAL_LIQUIDITY = 500 * 10 ** 9 // 500 SUI * 10^9 (for 9 decimals)
export const TARGET_QUOTE_LIQUIDITY = 2_500 * 10 ** 9 // 2,500 SUI * 10^9 (for 9 decimals)
export const BASE_LIQUIDITY_PROVISION = 2500 // 25% in basis points

export const COIN_CONVENTION_BLACKLIST = ["SUI", "ETH", "USDC", "USDT", "SOL", "BNB", "WBNB", "WETH", "BTC", "WBTC"]