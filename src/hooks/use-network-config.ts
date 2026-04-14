import { createNetworkConfig } from "@mysten/dapp-kit";
import { getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc";
import { Network } from "@/types/network";
import { MAINNET_RPC_URL } from "@/lib/sui-network";

const useNetworkConfig = () => {
	return createNetworkConfig({
		[Network.MAINNET]: {
			network: Network.MAINNET,
			url: MAINNET_RPC_URL,
		},
		[Network.TESTNET]: {
			network: Network.TESTNET,
			url: getJsonRpcFullnodeUrl(Network.TESTNET),
		},
	});
};

export default useNetworkConfig;
