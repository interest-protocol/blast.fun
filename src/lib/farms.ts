import { FarmsSDK } from '@interest-protocol/farms';
import { env } from "@/env"
import { Network } from "@/types/network"
import { getSuiFullnodeUrl } from "@/lib/sui-network"

const fullNodeUrl = getSuiFullnodeUrl()

export const farmsSdk = new FarmsSDK({
	network: env.NEXT_PUBLIC_DEFAULT_NETWORK as Network,
	fullNodeUrl
})