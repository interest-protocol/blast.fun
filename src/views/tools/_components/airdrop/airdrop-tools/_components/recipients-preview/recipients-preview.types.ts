import { AirdropRecipient } from "../../airdrop-tools.types"

export interface RecipientsPreviewProps {
  recipients: AirdropRecipient[]
  isResolving: boolean
  totalAmount: number
}