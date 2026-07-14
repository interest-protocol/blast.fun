import { MemezPumpSDK, MemezWalletSDK, SHARED_OBJECTS, XPumpMigratorSDK } from "@interest-protocol/memez-fun-sdk"
import { env } from "@/env"
import { MemezVestingGrpcSDK } from "@/lib/memez/vesting-grpc"
import { suiClient } from "@/lib/sui-client"
import { suiGrpcClient } from "@/lib/sui-grpc"
import { getSuiFullnodeUrl } from "@/lib/sui-network"
import { Network } from "@/types/network"

const fullNodeUrl = getSuiFullnodeUrl()

export const pumpSdk = new MemezPumpSDK({
	network: env.NEXT_PUBLIC_DEFAULT_NETWORK as Network,
	fullNodeUrl,
})

export const migratorSdk = new XPumpMigratorSDK({
	network: env.NEXT_PUBLIC_DEFAULT_NETWORK as Network,
	fullNodeUrl,
})

export const vestingSdk = new MemezVestingGrpcSDK({
	network: env.NEXT_PUBLIC_DEFAULT_NETWORK as Network,
	grpcClient: suiGrpcClient,
	jsonRpcClient: suiClient,
})

export const walletSdk = new MemezWalletSDK({
	network: env.NEXT_PUBLIC_DEFAULT_NETWORK as Network,
	fullNodeUrl,
	walletRegistryObjectId: SHARED_OBJECTS[env.NEXT_PUBLIC_DEFAULT_NETWORK as Network].WALLET_REGISTRY({ mutable: false })
		.objectId,
})
