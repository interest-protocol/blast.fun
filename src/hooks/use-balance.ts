import { formatAmount } from "@/utils/format";
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { useEffect } from "react";

const DEFAULT_REFETCH_INTERVAL = 3000;

export interface IUseBalanceParams {
    autoRefetch?: boolean;
    autoRefetchInterval?: number;
}

export interface IUseBalanceResponse {
    balance: string | undefined;
    error: Error | null;
    refetch: () => void;
}

const useBalance = ({
    autoRefetch,
    autoRefetchInterval,
}: IUseBalanceParams = {}): IUseBalanceResponse => {
    const currentAccount = useCurrentAccount();
    const { data, refetch, error } = useSuiClientQuery("getBalance", {
        owner: currentAccount?.address as string,
    });

    useEffect(() => {
        if (autoRefetch == null || autoRefetch === false) {
            return;
        }

        const interval = setInterval(
            () => {
                if (currentAccount == null || !autoRefetch) {
                    clearInterval(interval);
                    return;
                }

                refetch();
            },
            autoRefetch && autoRefetchInterval != null
                ? autoRefetchInterval
                : DEFAULT_REFETCH_INTERVAL
        );

        return () => {
            clearTimeout(interval);
        };
    }, [refetch, autoRefetch, autoRefetchInterval, currentAccount]);

    return {
        balance: data ? formatAmount(data.totalBalance) : undefined,
        error,
        refetch: async () => {
            refetch();
        },
    };
};

export default useBalance;
