export interface TradeButtonProps {
  tradeType: "buy" | "sell"
  amount: string
  isProcessing: boolean
  symbol?: string
  hasBalance: boolean
  handleTrade: () => void
}