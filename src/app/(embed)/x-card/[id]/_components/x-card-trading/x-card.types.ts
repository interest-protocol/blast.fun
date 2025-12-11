import { Token } from "@/types/token"

export interface XCardTradingProps {
    pool: Token
    referrerWallet?: string | null
    refCode?: string | null
}