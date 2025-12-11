export interface TradeTabsProps {
  tradeType: "buy" | "sell"
  setTradeType: (t: "buy" | "sell") => void
  hasBalance: boolean
}