import { WalletCoin } from "@/types/blockvision"

export interface AirdropConfigProps {
  coins: WalletCoin[]
  isLoadingCoins: boolean
  selectedCoin: string
  onSelectCoin: (coinType: string) => void
  csvInput: string
  onChangeCsv: (v: string) => void
  linesCount: number
}