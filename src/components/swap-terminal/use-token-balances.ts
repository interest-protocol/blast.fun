import { useMemo } from "react";
import { useTokenBalance } from "@/hooks/sui/use-token-balance";
import { SUI_TYPE_ARG, MIST_PER_SUI } from "@mysten/sui/utils";
import { TokenOption } from "./types";

export const useTokenBalances = (
    fromToken: TokenOption | null,
    toToken: TokenOption | null
) => {
    const { balance: fromBalance } = useTokenBalance(fromToken?.coinType);
    const { balance: toBalance } = useTokenBalance(toToken?.coinType);

    const fromBalanceDisplay = useMemo(() => {
        if (!fromToken || !fromBalance) return 0;
        const decimals = fromToken.decimals || 9;
        if (fromToken.coinType === SUI_TYPE_ARG) {
            return Number(fromBalance) / Number(MIST_PER_SUI);
        }
        return Number(fromBalance) / Math.pow(10, decimals);
    }, [fromToken, fromBalance]);

    const toBalanceDisplay = useMemo(() => {
        if (!toToken || !toBalance) return 0;
        const decimals = toToken.decimals || 9;
        if (toToken.coinType === SUI_TYPE_ARG) {
            return Number(toBalance) / Number(MIST_PER_SUI);
        }
        return Number(toBalance) / Math.pow(10, decimals);
    }, [toToken, toBalance]);

    return { fromBalanceDisplay, toBalanceDisplay };
};

