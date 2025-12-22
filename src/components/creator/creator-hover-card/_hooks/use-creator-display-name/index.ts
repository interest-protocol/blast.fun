import { useMemo } from "react";

import { useResolveSuiNSName } from "@mysten/dapp-kit";
import { formatAddress } from "@mysten/sui/utils";

interface UseCreatorDisplayNameProps {
    twitterHandle?: string
    walletAddress?: string
}

export const useCreatorDisplayName = ({
    twitterHandle,
    walletAddress,
}: UseCreatorDisplayNameProps): string => {
    const { data: resolvedDomain } = useResolveSuiNSName(
        !twitterHandle && walletAddress ? walletAddress : null
    )

    return useMemo(() => {
        if (twitterHandle) return `@${twitterHandle}`
        if (resolvedDomain) return resolvedDomain
        return formatAddress(walletAddress || "")
    }, [twitterHandle, resolvedDomain, walletAddress])
}