import { createNetworkConfig } from "@mysten/dapp-kit"
import { getFullnodeUrl } from "@mysten/sui/client"
import { Network } from "@/types/network"

const useNetworkConfig = () => {
	return createNetworkConfig({
		[Network.MAINNET]: {
			url: "https://sui-mainnet.blockvision.org/v1/31F8x48Z8623IazBun5U5Rg3vOo",
		},
		[Network.TESTNET]: {
			url: getFullnodeUrl(Network.TESTNET),
		}
	})
}

export default useNetworkConfig
