import useSWR from "swr";

import { getCoinPrice } from "@/utils/price";

interface UseSuiPriceOptions {
    coinType: string;
    refreshInterval?: number;
}

export const usePrice = ({
    coinType,
    refreshInterval = 5 * 60 * 1000,
}: UseSuiPriceOptions) => {
    const {
        data: price,
        isLoading,
        error,
    } = useSWR<number>(coinType, () => getCoinPrice(coinType), {
        refreshInterval,
    });

    return { price, isLoading, error };
};
