import type { TokenListItemInput } from "@/lib/enhance-token"
import type { NoodlesCoinListItem } from "./types"

/**
 * Maps a Noodles coin-new / coin-list / coin-top item to the app's token list shape
 * so that TokenCard, enhanceTokens, and processTokenIconUrls work unchanged.
 * Noodles does not provide bonding curve state, poolId, or creator in list responses,
 * so we set safe defaults (bondingProgress=100, dev="", poolId="", no socials).
 */
export function mapNoodlesCoinToToken(item: NoodlesCoinListItem): TokenListItemInput {
	const marketCap = parseFloat(item.market_cap ?? "0") || 0
	const liquidity = parseFloat(item.liquidity_usd ?? "0") || 0
	const volume24h = item.volume_24h ?? 0
	const tx24h = item.tx_24h ?? 0

	const result: TokenListItemInput = {
		coinType: item.coin_type,
		name: item.name ?? "",
		symbol: item.symbol ?? "",
		logo: item.logo ?? "",
		decimals: item.decimals ?? 9,
		price: item.price ?? 0,
		priceChange1d: item.price_change_1d ?? 0,
		priceChange6h: item.price_change_6h ?? 0,
		priceChange4h: 0,
		priceChange1h: item.price_change_1h ?? 0,
		priceChange30m: 0,
		marketCap,
		liquidity,
		circulatingSupply: parseFloat(item.circulating_supply ?? "0") || 0,
		totalSupply: parseFloat(item.total_supply ?? "0") || 0,
		tx24h,
		txBuy24h: Math.floor(tx24h / 2),
		txSell24h: Math.floor(tx24h / 2),
		volume24h,
		volume6h: item.volume_6h ?? 0,
		volume4h: item.volume_4h ?? 0,
		volume1h: item.volume_1h ?? 0,
		volume30m: item.volume_30m ?? 0,
		holders: 0,
		holdersCount: 0,
		top10HolderPercent: 0,
		devHoldingPercent: 0,
		createdAt: item.published_at ?? "",
		verified: item.verified ?? false,
		rank: 0,
		dev: "",
		poolId: "",
		isProtected: false,
		bondingProgress: 1,
		buyVolume: volume24h / 2,
		sellVolume: volume24h / 2,
		twitter: "",
		telegram: "",
		website: "",
	}
	return result
}
