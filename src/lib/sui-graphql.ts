import { SuiGraphQLClient } from "@mysten/sui/graphql"
import { env } from "@/env"
import { getSuiGraphQLUrl } from "@/lib/sui-network"

export const suiGraphQLClient = new SuiGraphQLClient({
	url: getSuiGraphQLUrl(),
	network: env.NEXT_PUBLIC_DEFAULT_NETWORK,
})
