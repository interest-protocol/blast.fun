import { SuiClient } from "@mysten/sui/client"
import { getSuiFullnodeUrl } from "@/lib/sui-network"

export const suiClient = new SuiClient({
	url: getSuiFullnodeUrl(),
})
