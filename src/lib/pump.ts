import { MemezPumpSDK } from "@interest-protocol/memez-fun-sdk"
import { getFullnodeUrl } from "@mysten/sui/client"
import { env } from "@/env"

export const pumpSdk = new MemezPumpSDK({
	network: env.NEXT_PUBLIC_DEFAULT_NETWORK,
	fullNodeUrl: getFullnodeUrl(env.NEXT_PUBLIC_DEFAULT_NETWORK),
})
