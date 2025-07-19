import { createNetworkConfig } from "@mysten/dapp-kit"
import { getFullnodeUrl } from "@mysten/sui/client"
import { Network } from "@/types/network"

const useNetworkConfig = () => {
	return createNetworkConfig({
		[Network.LOCALNET]: {
			url: getFullnodeUrl(Network.LOCALNET),
		},
		[Network.DEVNET]: {
			url: getFullnodeUrl(Network.DEVNET),
		},
		[Network.TESTNET]: {
			url: getFullnodeUrl(Network.TESTNET),
		},
		[Network.MAINNET]: {
			url: getFullnodeUrl(Network.MAINNET),
		},
	})
}

export default useNetworkConfig
