import type { CoinMetadata } from "@/lib/coin-metadata"
import { InterestAccount, InterestFarm } from "@interest-protocol/farms"

export type ActionType = "deposit" | "withdraw"

export interface ActionProps {
    actionType: ActionType
}
export interface FarmTerminalProps {
    farm: InterestFarm
    account?: InterestAccount
    metadata: CoinMetadata | null
    onOperationSuccess: () => void
}
