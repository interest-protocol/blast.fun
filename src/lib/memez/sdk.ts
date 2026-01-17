import {
    MemezPumpSDK,
    MemezVestingSDK,
    MemezWalletSDK,
    SHARED_OBJECTS,
    XPumpMigratorSDK,
} from "@interest-protocol/memez-fun-sdk";
import { env } from "@/env";
import { Network } from "@/types/network";
import { getSuiFullnodeUrl } from "@/lib/sui-network";

const fullNodeUrl = getSuiFullnodeUrl();

export const pumpSdk = new MemezPumpSDK({
    network: env.NEXT_PUBLIC_DEFAULT_NETWORK as Network,
    fullNodeUrl,
});

export const migratorSdk = new XPumpMigratorSDK({
    network: env.NEXT_PUBLIC_DEFAULT_NETWORK as Network,
    fullNodeUrl,
});

export const vestingSdk = new MemezVestingSDK({
    network: env.NEXT_PUBLIC_DEFAULT_NETWORK as Network,
    fullNodeUrl,
});

export const walletSdk = new MemezWalletSDK({
    network: env.NEXT_PUBLIC_DEFAULT_NETWORK as Network,
    fullNodeUrl,
    walletRegistryObjectId: SHARED_OBJECTS[
        env.NEXT_PUBLIC_DEFAULT_NETWORK as Network
    ].WALLET_REGISTRY({ mutable: false }).objectId,
});
