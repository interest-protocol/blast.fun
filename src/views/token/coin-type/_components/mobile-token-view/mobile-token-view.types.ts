import { Token } from "@/types/token";

export interface MobileTab {
    id: string
    label: string
    icon: React.ComponentType<{ className?: string }>
    action?: () => void;
}

export interface MobileTokenViewProps {
    pool: Token;
    referral?: string;
    realtimePrice?: number | null;
    realtimeMarketCap?: number | null;
}
