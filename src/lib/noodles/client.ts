import type { TokenMarketData } from "@/types/token";
import { env } from "@/env";
import { NOODLES_API_BASE, type NoodlesCoinDetailResponse, type NoodlesCoinDetailResponseData } from "./types";

const NOODLES_CHAIN = "sui" as const;

export function noodlesHeaders(): HeadersInit {
	const headers: HeadersInit = {
		Accept: "application/json",
		"Content-Type": "application/json",
		"x-chain": NOODLES_CHAIN,
	};
	const apiKey = env.NOODLES_API_KEY;
	if (apiKey) {
		(headers as Record<string, string>)["x-api-key"] = apiKey;
	}
	return headers;
}

export async function fetchNoodlesCoinDetail(coinId: string): Promise<NoodlesCoinDetailResponse | null> {
	const apiKey = env.NOODLES_API_KEY;
	if (!apiKey) return null;

	const url = new URL(`${NOODLES_API_BASE}/api/v1/partner/coin-detail`);
	url.searchParams.set("coin_id", coinId);

	const response = await fetch(url.toString(), {
		headers: noodlesHeaders(),
		next: { revalidate: 60 },
	});

	if (!response.ok) return null;
	const data = (await response.json()) as NoodlesCoinDetailResponse;
	return data;
}

interface NoodlesCoinPriceVolumeResponse {
	data?: {
		price?: number;
		volume_24h?: number;
		price_change_24h?: number;
		volume_change_24h?: number;
	};
}

export async function fetchNoodlesMarketData(coinId: string): Promise<TokenMarketData | null> {
	const apiKey = env.NOODLES_API_KEY;
	if (!apiKey) return null;

	const [detailRes, priceVolumeRes] = await Promise.all([
		fetch(`${NOODLES_API_BASE}/api/v1/partner/coin-detail?coin_id=${encodeURIComponent(coinId)}`, {
			headers: noodlesHeaders(),
			next: { revalidate: 10 },
		}),
		fetch(`${NOODLES_API_BASE}/api/v1/partner/coin-price-volume?coin_id=${encodeURIComponent(coinId)}`, {
			headers: noodlesHeaders(),
			next: { revalidate: 10 },
		}),
	]);

	if (!detailRes.ok) return null;

	const detailJson = (await detailRes.json()) as NoodlesCoinDetailResponse;
	const data = detailJson?.data as NoodlesCoinDetailResponseData | undefined;
	if (!data?.coin) return null;

	const coin = data.coin;
	const priceChange = data.price_change;
	const priceNum = priceChange?.price != null ? parseFloat(priceChange.price) : 0;
	const marketCap = coin.market_cap != null ? parseFloat(coin.market_cap) : 0;
	const liquidity = coin.liquidity != null ? parseFloat(coin.liquidity) : 0;
	const holdersCount = coin.holders ?? 0;

	let volume24h = 0;
	if (priceVolumeRes.ok) {
		try {
			const pv = (await priceVolumeRes.json()) as NoodlesCoinPriceVolumeResponse;
			volume24h = pv?.data?.volume_24h ?? 0;
		} catch {
			// keep volume24h 0
		}
	}

	const out: TokenMarketData = {
		marketCap,
		holdersCount,
		volume24h,
		liquidity,
		price: priceNum,
		coinPrice: priceNum,
		bondingProgress: 0,
	};
	if (coin.circulating_supply != null) {
		out.circulating = parseFloat(coin.circulating_supply);
	}
	if (priceChange?.price_change_1h != null) out.price1HrAgo = priceChange.price_change_1h;
	if (priceChange?.price_change_6h != null) out.price4HrAgo = priceChange.price_change_6h;
	if (priceChange?.price_change_1d != null) out.price1DayAgo = priceChange.price_change_1d;

	return out;
}

export interface NoodlesCoinLiquidityPool {
	pool_id: string;
	protocol: string;
	coin_a: string;
	coin_b: string;
	amount_a: number;
	amount_b: number;
	amount_a_usd: number;
	amount_b_usd: number;
	price_a: number;
	price_b: number;
	tvl_usd: number;
	fee_rate?: number;
}

export interface NoodlesCoinLiquidityResponse {
	code?: number;
	message?: string;
	data?: {
		dex_liquidity?: NoodlesCoinLiquidityPool[];
		lending_liquidity?: unknown[];
		coin_info_map?: Record<
			string,
			{ coin_type: string; symbol: string; decimals?: number; icon_url?: string; verified?: boolean }
		>;
		pagination?: { offset: number; limit: number };
	};
}

export async function fetchNoodlesCoinLiquidity(coinType: string): Promise<string | null> {
	const apiKey = env.NOODLES_API_KEY;
	if (!apiKey) return null;
	try {
		const url = new URL(`${NOODLES_API_BASE}/api/v1/partner/coin/liquidity`);
		url.searchParams.set("coin_type", coinType);
		url.searchParams.set("pool_type", "dex");
		url.searchParams.set("limit", "10");

		const res = await fetch(url.toString(), {
			headers: noodlesHeaders(),
			next: { revalidate: 60 },
		});
		if (!res.ok) return null;
		const json = (await res.json()) as NoodlesCoinLiquidityResponse;
		const pools = json?.data?.dex_liquidity ?? [];
		const top = [...pools].sort((a, b) => (b.tvl_usd ?? 0) - (a.tvl_usd ?? 0))[0];
		return top?.pool_id ?? null;
	} catch {
		return null;
	}
}

export interface NoodlesPoolTradeEvent {
	id: number;
	timestamp: number;
	action: string;
	pool_address: string;
	coin_a_type: string;
	coin_b_type: string;
	coin_a_symbol: string;
	coin_b_symbol: string;
	price: number;
	amount_a: number;
	amount_b: number;
	amount_a_usd: number;
	amount_b_usd: number;
	a_to_b: boolean;
	tx_digest: string;
	sender: string;
	source?: string | null;
}

export interface NoodlesPoolTradeEventResponse {
	code?: number;
	message?: string;
	data?: NoodlesPoolTradeEvent[];
	pagination?: { last_cursor: number | null; last_timestamp?: number | null; limit?: number };
}

export async function fetchNoodlesPoolTradeEvents(
	poolAddress: string,
	limit: number,
	cursor?: number
): Promise<{ trades: NoodlesPoolTradeEvent[]; nextCursor: number | null }> {
	const apiKey = env.NOODLES_API_KEY;
	if (!apiKey) return { trades: [], nextCursor: null };
	try {
		const url = new URL(`${NOODLES_API_BASE}/api/v1/partner/pool/event/trade`);
		url.searchParams.set("pool_address", poolAddress);
		url.searchParams.set("limit", String(limit));
		if (cursor != null) url.searchParams.set("cursor", String(cursor));

		const res = await fetch(url.toString(), {
			headers: noodlesHeaders(),
			next: { revalidate: 5 },
		});
		if (!res.ok) return { trades: [], nextCursor: null };
		const json = (await res.json()) as NoodlesPoolTradeEventResponse;
		const trades = json?.data ?? [];
		const nextCursor = json?.pagination?.last_cursor ?? null;
		return { trades, nextCursor };
	} catch {
		return { trades: [], nextCursor: null };
	}
}

const NOODLES_DEX_PROTOCOLS = "cetus-clmm,aftermath-cpmm,flowx-clmm,flowx-cpmm,bluefin-clmm";

export async function fetchNoodlesPoolTradeEventsByProtocols(
	limit: number,
	cursor?: number,
	coinType?: string
): Promise<{ trades: NoodlesPoolTradeEvent[]; nextCursor: number | null }> {
	const apiKey = env.NOODLES_API_KEY;
	if (!apiKey) return { trades: [], nextCursor: null };
	try {
		const url = new URL(`${NOODLES_API_BASE}/api/v1/partner/pool/event/trade`);
		url.searchParams.set("protocols", NOODLES_DEX_PROTOCOLS);
		url.searchParams.set("limit", String(Math.min(limit * 3, 100)));
		if (cursor != null) url.searchParams.set("cursor", String(cursor));

		const res = await fetch(url.toString(), {
			headers: noodlesHeaders(),
			next: { revalidate: 5 },
		});
		if (!res.ok) return { trades: [], nextCursor: null };
		const json = (await res.json()) as NoodlesPoolTradeEventResponse;
		const allTrades = json?.data ?? [];
		const filtered = coinType
			? allTrades.filter((t) => t.coin_a_type === coinType || t.coin_b_type === coinType)
			: allTrades;
		const nextCursor = json?.pagination?.last_cursor ?? null;
		return { trades: filtered.slice(0, limit), nextCursor };
	} catch {
		return { trades: [], nextCursor: null };
	}
}

export interface NoodlesPortfolioCoin {
	coin_type: string;
	symbol: string;
	decimals: number;
	icon_url?: string | null;
	amount: number;
	usd_value: number;
	verified: boolean;
	price: number;
	pnl_today?: number | null;
	pnl_percent_today?: number | null;
	price_change_1d?: number | null;
}

export interface NoodlesPortfolioResponse {
	code?: number;
	message?: string;
	data?: NoodlesPortfolioCoin[];
}

export async function fetchNoodlesPortfolio(address: string): Promise<NoodlesPortfolioResponse | null> {
	const apiKey = env.NOODLES_API_KEY;
	if (!apiKey) return null;

	const url = new URL(`${NOODLES_API_BASE}/api/v1/partner/portfolio/coins`);
	url.searchParams.set("address", address);

	const response = await fetch(url.toString(), {
		headers: noodlesHeaders(),
		next: { revalidate: 30 },
	});

	if (!response.ok) return null;
	const json = (await response.json()) as NoodlesPortfolioResponse;
	return json;
}

// Trending coins

export interface NoodlesTrendingCoin {
	coin_type: string;
	name: string;
	symbol: string;
	logo: string | null;
	price: number;
	price_change_1d?: number | null;
	volume_24h?: number | null;
	rank?: number | null;
	decimals: number;
}

interface NoodlesTrendingResponse {
	code?: number;
	message?: string;
	data?: NoodlesTrendingCoin[];
}

export interface NoodlesTrendingParams {
	scorePeriod: "30m" | "1h" | "4h" | "6h" | "24h";
	limit?: number;
	offset?: number;
}

export async function fetchNoodlesCoinTrending(params: NoodlesTrendingParams): Promise<NoodlesTrendingCoin[] | null> {
	const apiKey = env.NOODLES_API_KEY;
	if (!apiKey) return null;

	const { scorePeriod, limit = 10, offset = 0 } = params;

	const body = {
		pagination: {
			limit: Math.min(limit, 50),
			offset,
		},
		score_period: scorePeriod,
	};

	const response = await fetch(`${NOODLES_API_BASE}/api/v1/partner/coin-trending`, {
		method: "POST",
		headers: noodlesHeaders(),
		body: JSON.stringify(body),
		next: { revalidate: 30 },
	});

	if (!response.ok) return null;

	const json = (await response.json()) as NoodlesTrendingResponse;
	return json.data ?? null;
}

export interface NoodlesCoinList {
	coinType: string;
	name: string;
	symbol: string;
	iconUrl: string;
	dev?: string;
	txs24h: number;
	txsSell24h: number;
	txsBuy24h: number;
	holders: number;
	devHoldings: number;
	sniperHoldings: number;
	top10Holdings: number;
	volume24h: number;
	marketCap: number;
	liquidity: number;
	publishedAt: string;
	protocol: string;
	protocolUrl: string;
	bondingCurveProgress: number;
	bondingCurvePoolId?: string | null;
	isAntiSniper?: boolean | null;
	graduatedTime?: string | null;
	decimals: number;
	socialMedia: {
		x?: string;
		website?: string;
		discord?: string;
	};
}

export interface NoodlesCoinListResponse {
	code?: number;
	message?: string;
	data?: NoodlesCoinList[];
}

export interface NoodlesCoinListFilters {
	protocol?: string[];
	coinIds?: string[];
	devAddress?: string;
	isGraduated?: boolean;
	atLeast1SocialLink?: boolean;
	hasX?: boolean;
	hasTelegram?: boolean;
	hasWebsite?: boolean;
	devSellAll?: boolean;
	devStillHolding?: boolean;
	top10HoldingPercentMin?: number;
	top10HoldingPercentMax?: number;
	devHoldingPercentMin?: number;
	devHoldingPercentMax?: number;
	sniperHoldingPercentMin?: number;
	sniperHoldingPercentMax?: number;
	holdersMin?: number;
	holdersMax?: number;
	marketCapMin?: number;
	marketCapMax?: number;
	bondingCurveProgressMin?: number;
	bondingCurveProgressMax?: number;
	volume24hMin?: number;
	volume24hMax?: number;
	txs24hMin?: number;
	txs24hMax?: number;
	txsBuy24hMin?: number;
	txsBuy24hMax?: number;
	txsSell24hMin?: number;
	txsSell24hMax?: number;
}

export interface NoodlesCoinListParams {
	pagination?: { offset?: number; limit?: number };
	orderBy?: "published_at" | "bonding_curve_progress" | "graduated_time";
	orderDirection?: "asc" | "desc";
	filters?: NoodlesCoinListFilters;
}

export function mapToNoodlesCoinList(raw: Record<string, any>): NoodlesCoinList {
	return {
		coinType: raw.coin_type,
		name: raw.name,
		symbol: raw.symbol,
		iconUrl: raw.icon_url,
		dev: raw.creator ?? raw.dev_address ?? undefined,
		txs24h: raw.txs_24h,
		txsSell24h: raw.txs_sell_24h,
		txsBuy24h: raw.txs_buy_24h,
		holders: raw.holders,
		devHoldings: raw.dev_holding_percent,
		sniperHoldings: raw.sniper_holding_percent,
		top10Holdings: raw.top_10_holding_percent,
		volume24h: raw.volume_24h,
		marketCap: raw.market_cap,
		liquidity: raw.liquidity,
		publishedAt: raw.published_at,
		protocol: raw.protocol,
		protocolUrl: raw.protocol_url,
		bondingCurveProgress: raw.bonding_curve_progress,
		bondingCurvePoolId: raw.bonding_curve_pool_id ?? null,
		isAntiSniper: raw.is_anti_sniper ?? null,
		graduatedTime: raw.graduated_time ?? null,
		decimals: raw.decimals,
		socialMedia: {
			x: raw.social_media?.x,
			website: raw.social_media?.website,
			discord: raw.social_media?.discord,
		},
	};
}

export async function fetchNoodlesCoinList(params: NoodlesCoinListParams = {}): Promise<NoodlesCoinListResponse | null> {
	const apiKey = env.NOODLES_API_KEY;
	if (!apiKey) return null;

	const { pagination, orderBy, orderDirection, filters } = params;

	// Map camelCase filters back to snake_case for the API
	const mappedFilters = filters
		? {
				...(filters.protocol && { protocol: filters.protocol }),
				...(filters.coinIds && { coin_ids: filters.coinIds }),
				...(filters.devAddress !== undefined && { dev_address: filters.devAddress }),
				...(filters.isGraduated !== undefined && { is_graduated: filters.isGraduated }),
				...(filters.atLeast1SocialLink !== undefined && { at_least_1_social_link: filters.atLeast1SocialLink }),
				...(filters.hasX !== undefined && { has_x: filters.hasX }),
				...(filters.hasTelegram !== undefined && { has_telegram: filters.hasTelegram }),
				...(filters.hasWebsite !== undefined && { has_website: filters.hasWebsite }),
				...(filters.devSellAll !== undefined && { dev_sell_all: filters.devSellAll }),
				...(filters.devStillHolding !== undefined && { dev_still_holding: filters.devStillHolding }),
				...(filters.top10HoldingPercentMin !== undefined && {
					top_10_holding_percent_min: filters.top10HoldingPercentMin,
				}),
				...(filters.top10HoldingPercentMax !== undefined && {
					top_10_holding_percent_max: filters.top10HoldingPercentMax,
				}),
				...(filters.devHoldingPercentMin !== undefined && { dev_holding_percent_min: filters.devHoldingPercentMin }),
				...(filters.devHoldingPercentMax !== undefined && { dev_holding_percent_max: filters.devHoldingPercentMax }),
				...(filters.sniperHoldingPercentMin !== undefined && {
					sniper_holding_percent_min: filters.sniperHoldingPercentMin,
				}),
				...(filters.sniperHoldingPercentMax !== undefined && {
					sniper_holding_percent_max: filters.sniperHoldingPercentMax,
				}),
				...(filters.holdersMin !== undefined && { holders_min: filters.holdersMin }),
				...(filters.holdersMax !== undefined && { holders_max: filters.holdersMax }),
				...(filters.marketCapMin !== undefined && { market_cap_min: filters.marketCapMin }),
				...(filters.marketCapMax !== undefined && { market_cap_max: filters.marketCapMax }),
				...(filters.bondingCurveProgressMin !== undefined && {
					bonding_curve_progress_min: filters.bondingCurveProgressMin,
				}),
				...(filters.bondingCurveProgressMax !== undefined && {
					bonding_curve_progress_max: filters.bondingCurveProgressMax,
				}),
				...(filters.volume24hMin !== undefined && { volume_24h_min: filters.volume24hMin }),
				...(filters.volume24hMax !== undefined && { volume_24h_max: filters.volume24hMax }),
				...(filters.txs24hMin !== undefined && { txs_24h_min: filters.txs24hMin }),
				...(filters.txs24hMax !== undefined && { txs_24h_max: filters.txs24hMax }),
				...(filters.txsBuy24hMin !== undefined && { txs_buy_24h_min: filters.txsBuy24hMin }),
				...(filters.txsBuy24hMax !== undefined && { txs_buy_24h_max: filters.txsBuy24hMax }),
				...(filters.txsSell24hMin !== undefined && { txs_sell_24h_min: filters.txsSell24hMin }),
				...(filters.txsSell24hMax !== undefined && { txs_sell_24h_max: filters.txsSell24hMax }),
			}
		: undefined;

	const body = {
		pagination: { offset: pagination?.offset ?? 0, limit: pagination?.limit ?? 20 },
		order_by: orderBy ?? "published_at",
		order_direction: orderDirection ?? "desc",
		...(mappedFilters && Object.keys(mappedFilters).length > 0 && { filters: mappedFilters }),
	};

	const response = await fetch(`${NOODLES_API_BASE}/api/v1/partner/curve/coins`, {
		method: "POST",
		headers: noodlesHeaders(),
		body: JSON.stringify(body),
		next: { revalidate: 30 },
	});

	if (!response.ok) return null;
	const json = (await response.json()) as { code?: number; message?: string; data?: unknown };
	const rawData = json.data;
	const rawList = Array.isArray(rawData)
		? rawData
		: ((rawData as Record<string, unknown>)?.list ?? (rawData as Record<string, unknown>)?.coins ?? []);
	const coins = (rawList as Record<string, unknown>[]).map(mapToNoodlesCoinList);
	return { code: json.code, message: json.message, data: coins };
}

export interface NoodlesCoinByProtocolItem {
	coin_type: string;
	name: string;
	symbol: string;
	logo: string | null;
	volume_24h: string | null;
	liquidity_usd: string | null;
	price: number | null;
	price_change_1h: number | null;
	price_change_6h: number | null;
	price_change_1d: number | null;
}

export interface NoodlesCoinByProtocolResponse {
	code?: number;
	message?: string;
	data?: NoodlesCoinByProtocolItem[];
}

export interface FetchNoodlesCoinByProtocolParams {
	protocols: string;
	limit?: number;
	offset?: number;
	sortField?: "volume_24h" | "liquidity_usd" | "price_change_1h" | "price_change_6h" | "price_change_1d";
	sortDirection?: "ASC" | "DESC";
}

export async function fetchNoodlesCoinByProtocol(
	params: FetchNoodlesCoinByProtocolParams
): Promise<NoodlesCoinByProtocolResponse | null> {
	const apiKey = env.NOODLES_API_KEY;
	if (!apiKey) return null;

	const url = new URL(`${NOODLES_API_BASE}/api/v1/partner/coin/by-protocol`);
	url.searchParams.set("protocols", params.protocols);
	if (params.limit != null) url.searchParams.set("limit", String(params.limit));
	if (params.offset != null) url.searchParams.set("offset", String(params.offset));
	if (params.sortField) url.searchParams.set("sort_field", params.sortField);
	if (params.sortDirection) url.searchParams.set("sort_direction", params.sortDirection);

	const response = await fetch(url.toString(), {
		headers: noodlesHeaders(),
		next: { revalidate: 30 },
	});

	if (!response.ok) return null;
	return (await response.json()) as NoodlesCoinByProtocolResponse;
}

export interface NoodlesCoinTrader {
	address: string;
	txBuy: number;
	txSell: number;
	amountBuy: number;
	amountSell: number;
	volBuy: number;
	volSell: number;
	pnl: number;
}

export interface NoodlesCoinTradersResponse {
	code?: number;
	message?: string;
	data?: NoodlesCoinTrader[];
}

export interface FetchNoodlesCoinTradersParams {
	coinType: string;
	period: "30d" | "7d" | "3d" | "1d";
	limit?: number;
	offset?: number;
	sortField?: "tx_buy" | "tx_sell" | "total_tx" | "amount_buy" | "amount_sell" | "vol_buy" | "vol_sell" | "pnl";
	sortDirection?: "asc" | "desc";
}

export async function fetchNoodlesCoinTraders(
	params: FetchNoodlesCoinTradersParams
): Promise<NoodlesCoinTradersResponse | null> {
	const apiKey = env.NOODLES_API_KEY;
	if (!apiKey) return null;

	const url = new URL(`${NOODLES_API_BASE}/api/v1/partner/coin-traders`);
	url.searchParams.set("coin_type", params.coinType);
	url.searchParams.set("period", params.period);
	if (params.limit != null) url.searchParams.set("limit", String(params.limit));
	if (params.offset != null) url.searchParams.set("offset", String(params.offset));
	if (params.sortField) url.searchParams.set("sort_field", params.sortField);
	if (params.sortDirection) url.searchParams.set("sort_direction", params.sortDirection);

	const response = await fetch(url.toString(), {
		headers: noodlesHeaders(),
		next: { revalidate: 30 },
	});

	if (!response.ok) return null;
	const json = (await response.json()) as { code?: number; message?: string; data?: Record<string, unknown>[] };
	const traders = (json.data ?? []).map(
		(raw): NoodlesCoinTrader => ({
			address: String(raw.address ?? ""),
			txBuy: Number(raw.tx_buy ?? 0),
			txSell: Number(raw.tx_sell ?? 0),
			amountBuy: Number(raw.amount_buy ?? 0),
			amountSell: Number(raw.amount_sell ?? 0),
			volBuy: Number(raw.vol_buy ?? 0),
			volSell: Number(raw.vol_sell ?? 0),
			pnl: Number(raw.pnl ?? 0),
		})
	);
	return { code: json.code, message: json.message, data: traders };
}
