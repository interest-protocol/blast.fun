import { createNetworkConfig } from "@mysten/dapp-kit"
import { getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc"
import { Network } from "@/types/network"
import { getSuiFullnodeUrl } from "@/lib/sui-network"

const useNetworkConfig = () => {
	return createNetworkConfig({
		[Network.MAINNET]: {
			network: Network.MAINNET,
			url: getSuiFullnodeUrl(Network.MAINNET),
		},
		[Network.TESTNET]: {
			network: Network.TESTNET,
			url: getJsonRpcFullnodeUrl(Network.TESTNET),
		}
	})
}

export default useNetworkConfig
