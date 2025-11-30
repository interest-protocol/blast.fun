import { getFullnodeUrl } from "@mysten/sui/client";
import { env } from "@/env";
import { Network } from "@/types/network";

export const MAINNET_RPC_URL =
    "https://api.shinami.com/node/v1/sui_mainnet_f8ba2ad72d9ad60899e56d2f9d813e2b";

export function getSuiFullnodeUrl(): string {
    if (env.NEXT_PUBLIC_DEFAULT_NETWORK === Network.MAINNET)
        return MAINNET_RPC_URL;

    return getFullnodeUrl(Network.TESTNET);
}
