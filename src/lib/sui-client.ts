import { env } from "@/env";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";

export const suiClient = new SuiClient({
    url: getFullnodeUrl(env.NEXT_PUBLIC_DEFAULT_NETWORK),
});
