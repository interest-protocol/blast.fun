import { FarmsSDK } from '@interest-protocol/farms';
import { getFullnodeUrl } from "@mysten/sui/client"
import { env } from "@/env"
import { Network } from "@/types/network"

const fullNodeUrl = getFullnodeUrl(env.NEXT_PUBLIC_DEFAULT_NETWORK)

export const farmsSdk = new FarmsSDK({
	network: env.NEXT_PUBLIC_DEFAULT_NETWORK as Network,
	fullNodeUrl
})