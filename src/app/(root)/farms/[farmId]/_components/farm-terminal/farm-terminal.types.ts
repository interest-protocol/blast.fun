import { CoinMetadata } from "@/lib/interest-protocol-api"
import { InterestAccount, InterestFarm } from "@interest-protocol/farms"

export interface FarmTerminalProps {
    farm: InterestFarm
    account?: InterestAccount
    metadata: CoinMetadata | null
    onOperationSuccess: () => void
}