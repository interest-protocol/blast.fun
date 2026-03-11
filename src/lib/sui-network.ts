import { getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc";
import { env } from "@/env";
import { Network } from "@/types/network";

export const MAINNET_RPC_URL =
    "https://api.shinami.com/node/v1/sui_mainnet_e322e14ed835db7df728b33f26a0d0f2";

export function getSuiFullnodeUrl(): string {
    if (env.NEXT_PUBLIC_DEFAULT_NETWORK === Network.MAINNET)
        return MAINNET_RPC_URL;

    return getJsonRpcFullnodeUrl(Network.TESTNET);
}
