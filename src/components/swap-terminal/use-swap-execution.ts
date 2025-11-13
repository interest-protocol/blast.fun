import { useCallback } from "react";
import { useApp } from "@/context/app.context";
import { useTransaction } from "@/hooks/sui/use-transaction";
import { executeSwap } from "@/lib/aftermath";
import toast from "react-hot-toast";
import { TokenOption } from "./types";

interface UseSwapExecutionProps {
    fromToken: TokenOption | null;
    toToken: TokenOption | null;
    fromAmount: string;
    slippage: number;
    onSuccess?: () => void;
}

export const useSwapExecution = ({
    fromToken,
    toToken,
    fromAmount,
    slippage,
    onSuccess,
}: UseSwapExecutionProps) => {
    const { address, isConnected, setIsConnectDialogOpen } = useApp();
    const { executeTransaction } = useTransaction();

    const handleSwap = useCallback(async () => {
        if (!isConnected || !address) {
            setIsConnectDialogOpen(true);
            return;
        }

        if (
            !fromToken ||
            !toToken ||
            !fromAmount ||
            parseFloat(fromAmount) <= 0
        ) {
            toast.error("Please enter a valid amount");
            return;
        }

        try {
            const decimals = fromToken.decimals || 9;
            const amountIn = BigInt(
                Math.floor(parseFloat(fromAmount) * Math.pow(10, decimals))
            );

            const tx = await executeSwap({
                coinInType: fromToken.coinType,
                coinOutType: toToken.coinType,
                amountIn,
                address,
                slippagePercentage: slippage,
            });

            await executeTransaction(tx);
            toast.success("Swap completed successfully!");

            onSuccess?.();
        } catch (error) {
            console.error("Swap failed:", error);
            toast.error(error instanceof Error ? error.message : "Swap failed");
            throw error;
        }
    }, [
        isConnected,
        address,
        fromToken,
        toToken,
        fromAmount,
        slippage,
        executeTransaction,
        setIsConnectDialogOpen,
        onSuccess,
    ]);

    return { handleSwap, isConnected };
};

