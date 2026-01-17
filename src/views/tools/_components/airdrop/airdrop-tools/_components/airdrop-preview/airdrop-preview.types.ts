import { WalletCoin } from "@/types/blockvision"
import { AirdropRecipient } from "../../airdrop-tools.types"

export interface AirdropPreviewProps {
  selectedCoinInfo?: WalletCoin
  recipients: AirdropRecipient[]
  totalAmount: number
  isRecoveringGas: boolean
  isAirdropComplete: boolean
  lastCsvInput?: string
  csvInput: string
  delegatorAddress?: string
  airdropProgress?: string | null
  isProcessing: boolean
  handleAirdrop: () => Promise<void> | void
}