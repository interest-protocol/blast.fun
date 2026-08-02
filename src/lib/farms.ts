import { env } from "@/env"
import { Network } from "@/types/network"
import { FarmsGraphQLSDK } from "@/lib/farms-graphql"
import { suiGraphQLClient } from "@/lib/sui-graphql"

export const farmsSdk = new FarmsGraphQLSDK({
	network: env.NEXT_PUBLIC_DEFAULT_NETWORK as Network,
	graphQLClient: suiGraphQLClient,
})
