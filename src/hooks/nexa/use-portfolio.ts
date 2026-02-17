"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { fetchPortfolio } from "@/lib/fetch-portfolio";

export function usePortfolio(coinType?: string) {
    const account = useCurrentAccount();

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["portfolio-balance", account?.address, coinType],
        queryFn: async () => {
            if (!account?.address) return null;
            return fetchPortfolio(
                "0x48cd5cc87a128a65162c84f5c8b33f12cd5ceddc72d9918ea4713eb5446ddab2",
            );
        },
        enabled: !!account?.address,
        refetchInterval: 8000,
        gcTime: 0,
    });

    // find specific coin balance if coinType is provided
    const coinBalance =
        coinType && data?.balances
            ? data.balances.find((b) => b.coinType === coinType)
            : null;

    return {
        portfolio: data,
        coinBalance,
        balance: coinBalance?.balance || "0",
        isLoading,
        error,
        refetch,
    };
}
