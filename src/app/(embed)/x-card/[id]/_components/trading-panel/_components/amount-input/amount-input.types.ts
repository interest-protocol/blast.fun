export interface AmountInputProps {
  amount: string
  setAmount: (v: string) => void
  isProcessing: boolean
  tradeType: "buy" | "sell"
  symbol?: string
  slippage: string
  setSlippage: (v: string) => void
}