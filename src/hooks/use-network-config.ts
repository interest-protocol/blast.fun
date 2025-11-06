import { createNetworkConfig } from "@mysten/dapp-kit"
import { getFullnodeUrl } from "@mysten/sui/client"
import { Network } from "@/types/network"
import { MAINNET_RPC_URL } from "@/lib/sui-network"

const useNetworkConfig = () => {
	return createNetworkConfig({
		[Network.MAINNET]: {
			url: MAINNET_RPC_URL,
		},
		[Network.TESTNET]: {
			url: getFullnodeUrl(Network.TESTNET),
		}
	})
}

export default useNetworkConfig
