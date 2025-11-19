import { SUI_TYPE_ARG } from "@mysten/sui/utils";
import type { TokenCategory, TokenOption } from "./swap-terminal.types";

export const CATEGORIES: { key: TokenCategory; label: string }[] = [
    { key: "newly-created", label: "NEWLY CREATED" },
    { key: "near-graduated", label: "NEAR GRADUATED" },
    { key: "graduated", label: "GRADUATED" },
];

export const DEFAULT_EXPANDED_CATEGORY: TokenCategory = "newly-created";

export const VERIFIED_TOKENS_URL =
    "https://interest-protocol.github.io/tokens/sui.json";

export const SLIPPAGE_OPTIONS = [0.1, 0.5, 1, 3] as const;
export const DEFAULT_SLIPPAGE = 1;

export const DEFAULT_DECIMALS = 9;
export const SUI_ICON_URL = "/assets/currency/sui-fill.svg";

export const DEFAULT_SUI_TOKEN: TokenOption = {
    iconUrl: SUI_ICON_URL,
    coinType: SUI_TYPE_ARG,
    symbol: "SUI",
    name: "Sui",
    decimals: DEFAULT_DECIMALS,
};

export const SUI_RESERVE_AMOUNT = 0.02;

export const SEARCH_DEBOUNCE_MS = 500;
export const MIN_SEARCH_LENGTH = 2;

export const NEWLY_CREATED_REFETCH_INTERVAL = 10000;
export const NEAR_GRADUATED_REFETCH_INTERVAL = 10000;
export const GRADUATED_REFETCH_INTERVAL = 30000;

export const VERIFIED_TOKENS_STALE_TIME = 5 * 60 * 1000;
export const VERIFIED_TOKENS_REFETCH_INTERVAL = 10 * 60 * 1000;

export const WALLET_TOKENS_STALE_TIME = 30 * 1000;
export const WALLET_TOKENS_REFETCH_INTERVAL = 60 * 1000;

