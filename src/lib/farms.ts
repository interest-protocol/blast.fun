import { env } from "@/env"
import { Network } from "@/types/network"
import { FarmsGrpcSDK } from "@/lib/farms-grpc"
import { suiGrpcClient } from "@/lib/sui-grpc"
import { suiClient } from "@/lib/sui-client"

export const farmsSdk = new FarmsGrpcSDK({
	network: env.NEXT_PUBLIC_DEFAULT_NETWORK as Network,
	grpcClient: suiGrpcClient,
	jsonRpcClient: suiClient,
})
