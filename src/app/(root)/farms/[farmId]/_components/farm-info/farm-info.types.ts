import { CoinMetadata } from "@/lib/interest-protocol-api"
import { InterestAccount, InterestFarm } from "@interest-protocol/farms"

export interface FarmInfoProps {
    farm: InterestFarm
    account?: InterestAccount
    metadata: CoinMetadata | null
    onOperationSuccess: () => void
}