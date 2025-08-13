import { MemezPumpSDK, XPumpMigratorSDK } from "@interest-protocol/memez-fun-sdk"
import { getFullnodeUrl } from "@mysten/sui/client"
import { env } from "@/env"
import { Network } from "@/types/network"

const fullNodeUrl = "https://sui-mainnet.blockvision.org/v1/31F8x48Z8623IazBun5U5Rg3vOo"

export const pumpSdk = new MemezPumpSDK({
	network: env.NEXT_PUBLIC_DEFAULT_NETWORK as Network,
	fullNodeUrl
})

export const migratorSdk = new XPumpMigratorSDK({
	network: env.NEXT_PUBLIC_DEFAULT_NETWORK as Network,
	fullNodeUrl
})