export interface TokenOption {
    coinType: string;
    symbol: string;
    name: string;
    iconUrl?: string;
    decimals?: number;
}

export type TokenCategory = "newly-created" | "near-graduated" | "graduated";
export type TokenSection = "verified" | "wallet";
export type SectionKey =
    | "global"
    | "verified"
    | "wallet"
    | "newly-created"
    | "near-graduated"
    | "graduated";

export interface BlastTabProps {
    searchQuery: string;
    onSelectToken: (token: TokenOption) => void;
    fromToken: TokenOption | null;
    toToken: TokenOption | null;
}

export interface SearchResultsViewProps {
    searchQuery: string;
    globalSearchResults: TokenOption[];
    isSearching: boolean;
    onSelectToken: (token: TokenOption) => void;
    disabledCoinTypes: string[];
}

export interface CollapsibleTokenCategoryProps {
    category: TokenCategory;
    label: string;
    searchQuery: string;
    onSelectToken: (token: TokenOption) => void;
    isOpen: boolean;
    onToggle: (category: TokenCategory, isOpen: boolean) => void;
    disabledCoinTypes?: string[];
}

export interface TokenGridProps {
    tokens: TokenOption[];
    isLoading: boolean;
    searchQuery: string;
    onSelectToken: (token: TokenOption) => void;
    disabledCoinTypes?: string[];
}

export interface TokenSearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onSelectToken: (token: TokenOption) => void;
    fromToken: TokenOption | null;
    toToken: TokenOption | null;
}

export interface TokenSelectorButtonProps {
    token: TokenOption | null;
    onClick: () => void;
}

export interface TokenInputSectionProps {
    token: TokenOption | null;
    amount: string;
    onAmountChange: (amount: string) => void;
    balance: number;
    usdValue?: number;
    isLoading?: boolean;
    isReadOnly?: boolean;
    onTokenSelect: () => void;
    showMaxButton?: boolean;
    onMaxClick?: () => void;
    priceDisplay?: string;
}

export interface SwapDialogContentProps {
    fromToken: TokenOption | null;
    toToken: TokenOption | null;
    fromAmount: string;
    toAmount: string;
    fromBalanceDisplay: number;
    toBalanceDisplay: number;
    usdValue: number;
    isLoadingQuote: boolean;
    isSwapping: boolean;
    isConnected: boolean;
    slippage: number;
    isValidAmount: boolean;
    toAmountPriceDisplay: string;
    onFromAmountChange: (amount: string) => void;
    onTokenSelect: (side: "from" | "to") => void;
    onSwapTokens: () => void;
    onSwap: () => void;
    onMaxClick: () => void;
    onSettingsClick: () => void;
}

export interface SwapActionButtonProps {
    fromToken: TokenOption | null;
    toToken: TokenOption | null;
    fromAmount: string;
    isSwapping: boolean;
    isLoadingQuote: boolean;
    isConnected: boolean;
    isValidAmount: boolean;
    onClick: () => void;
}

export interface SwapDirectionButtonProps {
    onClick: () => void;
}

export interface SlippageSettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    slippage: number;
    onSlippageChange: (slippage: number) => void;
}

export interface SettingsBarProps {
    slippage: number;
    onSettingsClick: () => void;
}

export interface TokensTabProps {
    searchQuery: string;
    onSelectToken: (token: TokenOption) => void;
    fromToken: TokenOption | null;
    toToken: TokenOption | null;
}

export interface VerifiedTokensTabProps {
    searchQuery: string;
    onSelectToken: (token: TokenOption) => void;
    disabledCoinTypes?: string[];
}

export interface WalletTabProps {
    searchQuery: string;
    onSelectToken: (token: TokenOption) => void;
    disabledCoinTypes?: string[];
}

export interface UseSwapQuoteProps {
    fromToken: TokenOption | null;
    toToken: TokenOption | null;
    fromAmount: string;
    slippage: number;
}

export interface UseSwapExecutionProps {
    fromToken: TokenOption | null;
    toToken: TokenOption | null;
    fromAmount: string;
    slippage: number;
    onSuccess?: () => void;
}

export interface WalletCoin {
    coinType: string;
    balance: string;
    decimals: number;
    symbol: string;
    name: string;
    iconUrl?: string;
}

export interface VerifiedTokenData {
    type: string;
    symbol: string;
    name: string;
    logoUrl?: string;
    decimals?: number;
}
