import { BASE_DOMAIN } from "@/constants";

export type TrendingCoin = {
    coinType: string;
    name: string;
    symbol: string;
    price: number;
    priceChange1d: number;
    volume24h: number;
};

export async function fetchTrendingCoins(
    period: "30m" | "1h" | "4h" | "6h" | "24h" = "24h",
    limit = 20,
): Promise<TrendingCoin[]> {
    const base = typeof window !== "undefined" ? "" : BASE_DOMAIN;

    const res = await fetch(
        `${base}/api/coin/trending?period=${encodeURIComponent(period)}`,
        { headers: { Accept: "application/json" } },
    );

    if (!res.ok) return [];

    const json = await res.json();
    const coins = (json.coins || []) as Array<{
        coin_type: string;
        name: string;
        symbol: string;
        price: number;
        price_change_1d?: number | null;
        volume_24h?: number | null;
    }>;

    return coins.slice(0, limit).map((coin) => ({
        coinType: coin.coin_type,
        name: coin.name,
        symbol: coin.symbol?.toUpperCase() || "???",
        price: coin.price,
        priceChange1d: coin.price_change_1d ?? 0,
        volume24h: coin.volume_24h ?? 0,
    }));
}

