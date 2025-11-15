import { useState, useCallback, useEffect, useMemo } from "react";
import { useSuiPrice } from "@/hooks/sui/use-sui-price";
import { SUI_TYPE_ARG } from "@mysten/sui/utils";
import { formatNumberWithSuffix } from "@/utils/format";
import { TokenOption } from "./types";
import { useSwapQuote } from "./use-swap-quote";
import { useTokenBalances } from "./use-token-balances";
import { useSwapExecution } from "./use-swap-execution";

export const useSwapTerminal = () => {
    const [fromToken, setFromToken] = useState<TokenOption | null>(null);
    const [toToken, setToToken] = useState<TokenOption | null>(null);
    const [fromAmount, setFromAmount] = useState("");
    const [slippage, setSlippage] = useState(1);
    const [isSwapping, setIsSwapping] = useState(false);

    const { usd: suiPrice } = useSuiPrice();

    const { toAmount, isLoadingQuote, setToAmount } = useSwapQuote({
        fromToken,
        toToken,
        fromAmount,
        slippage,
    });

    const { fromBalanceDisplay, toBalanceDisplay } = useTokenBalances(
        fromToken,
        toToken
    );

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

    // Calculate USD value
    const usdValue = useMemo(() => {
        if (!fromAmount || parseFloat(fromAmount) <= 0) return 0;
        return parseFloat(fromAmount) * suiPrice;
    }, [fromAmount, suiPrice]);

    // Default to SUI for from token
    useEffect(() => {
        if (!fromToken) {
            setFromToken({
                iconUrl: "/assets/currency/sui-fill.svg",
                coinType: SUI_TYPE_ARG,
                symbol: "SUI",
                name: "Sui",
                decimals: 9,
            });
        }
    }, [fromToken]);

    // Handle token selection
    const handleSelectToken = useCallback(
        (token: TokenOption, side: "from" | "to") => {
            // Prevent selecting the same coinType for both sides
            if (side === "from") {
                if (toToken?.coinType === token.coinType) {
                    return; // Don't allow selecting the same token
                }
                setFromToken(token);
            } else {
                if (fromToken?.coinType === token.coinType) {
                    return; // Don't allow selecting the same token
                }
                setToToken(token);
            }
        },
        [fromToken, toToken]
    );

    // Swap tokens
    const handleSwapTokens = useCallback(() => {
        const temp = fromToken;
        setFromToken(toToken);
        setToToken(temp);
        const tempAmount = fromAmount;
        setFromAmount(toAmount);
        setToAmount(tempAmount);
    }, [fromToken, toToken, fromAmount, toAmount, setToAmount]);

    // Execute swap with loading state
    const handleSwap = useCallback(async () => {
        try {
            setIsSwapping(true);
            await executeSwap();
        } finally {
            setIsSwapping(false);
        }
    }, [executeSwap]);

    // Handle max button click
    const handleMaxClick = useCallback(() => {
        if (!fromToken) return;

        if (fromToken.coinType === SUI_TYPE_ARG) {
            const maxSui = Math.max(0, fromBalanceDisplay - 0.02);
            setFromAmount(maxSui.toString());
        } else {
            setFromAmount(fromBalanceDisplay.toString());
        }
    }, [fromToken, fromBalanceDisplay]);

    // Calculate to amount price display
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
        usdValue,
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
