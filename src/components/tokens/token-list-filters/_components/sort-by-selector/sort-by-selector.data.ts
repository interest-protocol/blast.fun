import { TokenSortOption } from "@/types/token";

export const OPTIONS: { value: TokenSortOption; label: string }[] = [
    { value: 'marketCap', label: 'MARKET CAP' },
    { value: 'volume', label: 'VOLUME' },
    { value: 'holders', label: 'HOLDERS' },
    { value: 'date', label: 'DATE' },
    { value: 'lastTrade', label: 'LAST TRADE' },
    { value: 'liquidity', label: 'LIQUIDITY' },
]