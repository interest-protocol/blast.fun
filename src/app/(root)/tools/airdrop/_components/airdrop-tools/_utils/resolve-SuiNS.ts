import { suiClient } from "@/lib/sui-client"
import { normalizeSuiNSName } from "@mysten/sui/utils"

export const resolveSuiName = async (input: string): Promise<string | null> => {
    try {
        const normalized = normalizeSuiNSName(input, "dot")
        const resolved = await suiClient.resolveNameServiceAddress({ name: normalized })
        return resolved || null
    } catch (err) {
        console.error("resolveSuiName error:", err)
        return null
    }
}
