import { useState, useCallback, useEffect, useMemo } from "react";
import { usePrice } from "@/hooks/sui/use-price";
import { SUI_TYPE_ARG } from "@mysten/sui/utils";
import { formatNumberWithSuffix } from "@/utils/format";
import type { TokenOption } from "./swap-terminal.types";
import { useSwapQuote } from "./use-swap-quote";
import { useTokenBalances } from "./use-token-balances";
import { useSwapExecution } from "./use-swap-execution";
import {
    DEFAULT_SLIPPAGE,
    DEFAULT_SUI_TOKEN,
    SUI_RESERVE_AMOUNT,
} from "./swap-terminal.data";

import { useLocalStorage } from "hooks-ts";

export const useSwapTerminal = () => {
    const [fromToken, setFromToken] = useState<TokenOption | null>(null);
    const [toToken, setToToken] = useState<TokenOption | null>(null);
    const [fromAmount, setFromAmount] = useState("");
    const [slippage, setSlippage] = useLocalStorage(
        "swap-terminal-slippage",
        DEFAULT_SLIPPAGE
    );
    const [isSwapping, setIsSwapping] = useState(false);

    const { price: tokenInPrice = 0 } = usePrice({
        coinType: fromToken?.coinType || "",
    });

    const { price: tokenOutPrice = 0 } = usePrice({
        coinType: toToken?.coinType || "",
    });

    const { toAmount, isLoadingQuote, setToAmount } = useSwapQuote({
        fromToken,
        toToken,
        fromAmount,
        slippage,
    });

    const { fromBalanceDisplay, toBalanceDisplay, refreshBalances } =
        useTokenBalances(fromToken, toToken);

    const { handleSwap: executeSwap, isConnected } = useSwapExecution({
        fromToken,
        toToken,
        fromAmount,
        slippage,
        onSuccess: () => {
            setFromAmount("");
            setToAmount("");
        },
    });

    const usdValueIn = useMemo(() => {
        if (!fromAmount || parseFloat(fromAmount) <= 0) return 0;
        return parseFloat(fromAmount) * tokenInPrice;
    }, [fromAmount, tokenInPrice]);

    const usdValueOut = useMemo(() => {
        if (!toAmount || parseFloat(toAmount) <= 0) return 0;
        return parseFloat(toAmount) * tokenOutPrice;
    }, [toAmount, tokenOutPrice]);

    useEffect(() => {
        if (!fromToken) {
            setFromToken(DEFAULT_SUI_TOKEN);
        }
    }, [fromToken]);

    const handleSelectToken = useCallback(
        (token: TokenOption, side: "from" | "to") => {
            if (side === "from") {
                if (toToken?.coinType === token.coinType) {
                    return;
                }
                setFromToken(token);
            } else {
                if (fromToken?.coinType === token.coinType) {
                    return;
                }
                setToToken(token);
            }
        },
        [fromToken, toToken]
    );

    const handleSwapTokens = useCallback(() => {
        const temp = fromToken;
        setFromToken(toToken);
        setToToken(temp);
        const tempAmount = fromAmount;
        setFromAmount(toAmount);
        setToAmount(tempAmount);
    }, [fromToken, toToken, fromAmount, toAmount, setToAmount]);

    const handleSwap = useCallback(async () => {
        try {
            setIsSwapping(true);
            await executeSwap();
        } finally {
            refreshBalances();
            setIsSwapping(false);
        }
    }, [executeSwap]);

    const handleMaxClick = useCallback(() => {
        if (!fromToken) return;

        if (fromToken.coinType === SUI_TYPE_ARG) {
            const maxSui = Math.max(0, fromBalanceDisplay - SUI_RESERVE_AMOUNT);
            setFromAmount(maxSui.toString());
        } else {
            setFromAmount(fromBalanceDisplay.toString());
        }
    }, [fromToken, fromBalanceDisplay]);

    const toAmountPriceDisplay = useMemo(() => {
        if (toAmount && parseFloat(toAmount) > 0) {
            return `≈ ${formatNumberWithSuffix(parseFloat(toAmount))} ${
                toToken?.symbol || ""
            }`;
        }
        return "Enter amount to see quote";
    }, [toAmount, toToken]);

    const isValidAmount =
        parseFloat(fromAmount) <= fromBalanceDisplay &&
        parseFloat(fromAmount) > 0;

    return {
        fromToken,
        toToken,
        fromAmount,
        toAmount,
        fromBalanceDisplay,
        toBalanceDisplay,
        usdValueIn,
        usdValueOut,
        isLoadingQuote,
        isSwapping,
        isConnected,
        slippage,
        setSlippage,
        isValidAmount,
        toAmountPriceDisplay,
        setFromAmount,
        handleSelectToken,
        handleSwapTokens,
        handleSwap,
        handleMaxClick,
    };
};
