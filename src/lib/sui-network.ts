import { getFullnodeUrl } from "@mysten/sui/client"
import { env } from "@/env"
import { Network } from "@/types/network"

export const MAINNET_RPC_URL = "https://wallet-rpc.mainnet.sui.io"

export function getSuiFullnodeUrl(): string {
	if (env.NEXT_PUBLIC_DEFAULT_NETWORK === Network.MAINNET) {
		return MAINNET_RPC_URL
	}

	return getFullnodeUrl(Network.TESTNET)
}