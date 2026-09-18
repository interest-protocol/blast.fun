import { suiGrpcClient } from "@/lib/sui-grpc"
import { normalizeSuiNSName } from "@mysten/sui/utils"

export const resolveSuiName = async (input: string): Promise<string | null> => {
    try {
        const normalized = normalizeSuiNSName(input, "dot")
        const { response } = await suiGrpcClient.nameService.lookupName({ name: normalized })
        return response.record?.targetAddress || null
    } catch (err) {
        console.error("resolveSuiName error:", err)
        return null
    }
}
