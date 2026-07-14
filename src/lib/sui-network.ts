import { env } from "@/env";
import { Network } from "@/types/network";

// @dev: Sui-maintained public fullnodes serve JSON-RPC and gRPC (sui.rpc.v2) on the same host
const SUI_FULLNODE_URLS: Record<Network, string> = {
    [Network.MAINNET]: "https://fullnode.mainnet.sui.io:443",
    [Network.TESTNET]: "https://fullnode.testnet.sui.io:443",
};

export function getSuiFullnodeUrl(network?: Network): string {
    return SUI_FULLNODE_URLS[
        network ?? (env.NEXT_PUBLIC_DEFAULT_NETWORK as Network)
    ];
}

export function getSuiGrpcUrl(): string {
    return env.NEXT_PUBLIC_SUI_GRPC_URL ?? getSuiFullnodeUrl();
}
