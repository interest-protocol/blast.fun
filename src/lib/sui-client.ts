import { SuiJsonRpcClient } from "@mysten/sui/jsonRpc"
import { getSuiFullnodeUrl } from "@/lib/sui-network"
import { Network } from "@/types/network"

export const suiClient = new SuiJsonRpcClient({
	url: getSuiFullnodeUrl(),
	network: Network.MAINNET,
})
