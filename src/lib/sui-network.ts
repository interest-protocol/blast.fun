import { env } from "@/env";
import { Network } from "@/types/network";

// @dev: Sui-maintained public fullnodes serve gRPC (sui.rpc.v2); JSON-RPC is no longer available there
const SUI_FULLNODE_URLS: Record<Network, string> = {
    [Network.MAINNET]: "https://fullnode.mainnet.sui.io:443",
    [Network.TESTNET]: "https://fullnode.testnet.sui.io:443",
};

const SUI_GRAPHQL_URLS: Record<Network, string> = {
    [Network.MAINNET]: "https://graphql.mainnet.sui.io/graphql",
    [Network.TESTNET]: "https://graphql.testnet.sui.io/graphql",
};

export function getSuiFullnodeUrl(network?: Network): string {
    return SUI_FULLNODE_URLS[
        network ?? (env.NEXT_PUBLIC_DEFAULT_NETWORK as Network)
    ];
}

export function getSuiGrpcUrl(): string {
    return env.NEXT_PUBLIC_SUI_GRPC_URL ?? getSuiFullnodeUrl();
}

export function getSuiGraphQLUrl(): string {
    const network = env.NEXT_PUBLIC_DEFAULT_NETWORK as Network;
    return env.NEXT_PUBLIC_SUI_GRAPHQL_URL ?? SUI_GRAPHQL_URLS[network];
}
