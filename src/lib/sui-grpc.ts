import { SuiGrpcClient } from "@mysten/sui/grpc"
import { getSuiGrpcUrl } from "@/lib/sui-network"
import { env } from "@/env"

export const suiGrpcClient = new SuiGrpcClient({
	network: env.NEXT_PUBLIC_DEFAULT_NETWORK,
	baseUrl: getSuiGrpcUrl(),
})
