export interface QuickActionsProps {
  tradeType: "buy" | "sell"
  isProcessing: boolean
  hasBalance: boolean
  handleQuickAmount: (value: number | string) => void
}