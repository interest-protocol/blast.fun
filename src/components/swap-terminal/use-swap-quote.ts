import { useEffect, useState } from "react";
import { getSwapQuote } from "@/lib/aftermath";
import type { TokenOption, UseSwapQuoteProps } from "./swap-terminal.types";
import { DEFAULT_DECIMALS } from "./swap-terminal.data";

export const useSwapQuote = ({
    fromToken,
    toToken,
    fromAmount,
    slippage,
}: UseSwapQuoteProps) => {
    const [toAmount, setToAmount] = useState("");
    const [isLoadingQuote, setIsLoadingQuote] = useState(false);

    useEffect(() => {
        const fetchQuote = async () => {
            if (
                !fromToken ||
                !toToken ||
                !fromAmount ||
                parseFloat(fromAmount) <= 0
            ) {
                setToAmount("");
                return;
            }

            try {
                setIsLoadingQuote(true);
                const decimals = fromToken.decimals || DEFAULT_DECIMALS;
                const amountIn = BigInt(
                    Math.floor(parseFloat(fromAmount) * Math.pow(10, decimals))
                );

                const quote = await getSwapQuote({
                    coinInType: fromToken.coinType,
                    coinOutType: toToken.coinType,
                    amountIn,
                    slippagePercentage: slippage,
                });

                const outDecimals = toToken.decimals || DEFAULT_DECIMALS;
                const amountOut =
                    Number(quote.amountOut) / Math.pow(10, outDecimals);
                setToAmount(amountOut.toFixed(6));
            } catch (error) {
                console.error("Failed to get quote:", error);
                setToAmount("");
            } finally {
                setIsLoadingQuote(false);
            }
        };

        fetchQuote();
    }, [fromToken, toToken, fromAmount, slippage]);

    return { toAmount, isLoadingQuote, setToAmount };
};

