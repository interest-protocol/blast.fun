import { env } from "@/env";
import { MemezPumpSDK } from "@interest-protocol/memez-fun-sdk";
import { getFullnodeUrl } from "@mysten/sui/client";

// @dev: we just hardcode this for now, but we can add a env later :(
export const pumpSdk = new MemezPumpSDK({
    network: env.NEXT_PUBLIC_DEFAULT_NETWORK,
    fullNodeUrl: getFullnodeUrl(env.NEXT_PUBLIC_DEFAULT_NETWORK),
});