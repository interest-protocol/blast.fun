import { SuiJsonRpcClient } from "@mysten/sui/jsonRpc"
import { getSuiFullnodeUrl } from "@/lib/sui-network"

export const suiClient = new SuiJsonRpcClient({
	url: getSuiFullnodeUrl(),
})
