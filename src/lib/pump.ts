import { Network } from "@/types/network";
import { MemezPumpSDK } from "@interest-protocol/memez-fun-sdk";
import { getFullnodeUrl } from "@mysten/sui/client";

// @dev: we just hardcode this for now, but we can add a env later :(
export const pumpSdk = new MemezPumpSDK({
    network: Network.MAINNET,
    fullNodeUrl: getFullnodeUrl(Network.MAINNET),
});