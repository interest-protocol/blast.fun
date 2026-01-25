import { TokenCardProps } from "../../token-card.types"

export interface TokenCardRightActionsProps  {
  symbol?: string
  coinType: string
  pool: TokenCardProps["pool"]
  column?: TokenCardProps["column"]
}