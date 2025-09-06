import { createNetworkConfig } from "@mysten/dapp-kit"
import { getFullnodeUrl } from "@mysten/sui/client"
import { Network } from "@/types/network"

const useNetworkConfig = () => {
	return createNetworkConfig({
		[Network.MAINNET]: {
			url: getFullnodeUrl(Network.MAINNET),
		},
		[Network.TESTNET]: {
			url: getFullnodeUrl(Network.TESTNET),
		},
	})
}

export default useNetworkConfig
