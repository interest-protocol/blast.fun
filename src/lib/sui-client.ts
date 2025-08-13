import { getFullnodeUrl, SuiClient } from "@mysten/sui/client"
import { env } from "@/env"

export const suiClient = new SuiClient({
	url: getFullnodeUrl(env.NEXT_PUBLIC_DEFAULT_NETWORK),
})
