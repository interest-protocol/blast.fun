import { Token } from "@/types/token"

export interface TradingPanelProps {
    pool: Token
    referrerWallet?: string | null
    refCode?: string | null
}
