export interface AirdropRecipient {
  address: string
  amount: string
  originalInput?: string
  isResolving?: boolean
  resolutionError?: string
}
