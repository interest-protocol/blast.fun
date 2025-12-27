"use client";

import { useCallback } from "react";
import toast from "react-hot-toast";
import { Transaction } from "@mysten/sui/transactions";
import { suiClient } from "@/lib/sui-client";
import type { WalletCoin } from "@/types/blockvision";
import { SuiSignAndExecuteTransactionOutput } from "@mysten/wallet-standard";
import { mergeAndPrepareReceive } from "./merge-and-prepare-receive";

export const useClaimHandlers = (
    address: string | undefined,
    memezWalletAddress: string | null,
    walletCoins: WalletCoin[],
    signAndExecuteTransaction: (
        params: { transaction: Transaction }
    ) => Promise<SuiSignAndExecuteTransactionOutput>,
    fetchWalletCoins: () => void,
    setClaimingCoinType: (type: string | null) => void
) => {
    const handleClaim = useCallback(
        async (coin: WalletCoin) => {
            if (!address || !memezWalletAddress) {
                toast.error("Wallet not connected or rewards address not loaded");
                return;
            }

            setClaimingCoinType(coin.coinType);
            const loadingToastId = toast.loading("Preparing your reward...");

            try {
                const tx = new Transaction();
                const result = await mergeAndPrepareReceive(
                    coin,
                    tx,
                    suiClient,
                    memezWalletAddress,
                    address
                );

                if (!result.success) {
                    throw new Error(result.error || "Failed to prepare coin");
                }

                toast.dismiss(loadingToastId);
                tx.setGasBudget(10000000);

                await signAndExecuteTransaction({ transaction: tx });

                toast.success(`${coin.symbol} claimed successfully!`);
                setTimeout(() => fetchWalletCoins(), 2000);
            } catch (error) {
                console.error("\n❌ CLAIM FAILED:", error);
                toast.dismiss(loadingToastId);
                toast.error(
                    `Failed to claim ${coin.symbol}: ${error instanceof Error ? error.message : "Unknown error"}`
                );
            } finally {
                setClaimingCoinType(null);
            }
        },
        [
            address,
            memezWalletAddress,
            signAndExecuteTransaction,
            fetchWalletCoins,
            setClaimingCoinType,
        ]
    );

    const handleClaimAll = useCallback(async () => {
        if (walletCoins.length === 0 || !address || !memezWalletAddress) {
            if (walletCoins.length === 0) return;
            toast.error("Wallet not connected or rewards address not loaded");
            return;
        }

        const MAX_COINS = 10;
        const coinsToProcess = walletCoins.slice(0, MAX_COINS);
        setClaimingCoinType("all");
        let progressToastId: string | undefined;

        try {
            const tx = new Transaction();
            let successCount = 0;
            const failedCoins: string[] = [];

            for (let i = 0; i < coinsToProcess.length; i++) {
                const coin = coinsToProcess[i];
                if (progressToastId) toast.dismiss(progressToastId);
                progressToastId = toast.loading(
                    `Preparing ${coin.symbol} (${i + 1}/${coinsToProcess.length})...`
                );

                const result = await mergeAndPrepareReceive(
                    coin,
                    tx,
                    suiClient,
                    memezWalletAddress,
                    address
                );

                if (result.success) successCount++;
                else failedCoins.push(coin.symbol);
            }

            if (progressToastId) toast.dismiss(progressToastId);
            if (successCount === 0) throw new Error("No coins could be prepared for claiming");

            if (failedCoins.length > 0) {
                toast.error(`Could not claim: ${failedCoins.join(", ")}`);
            }
            if (walletCoins.length > MAX_COINS) {
                toast(`Processing first ${MAX_COINS} coins. Run claim all again for remaining coins.`);
            }

            tx.setGasBudget(10000000);
            await signAndExecuteTransaction({ transaction: tx });

            toast.success(`Successfully claimed ${successCount} reward(s)!`);
            setTimeout(() => fetchWalletCoins(), 2000);
        } catch (error) {
            console.error("\n❌ CLAIM ALL FAILED:", error);
            if (progressToastId) toast.dismiss(progressToastId);
            toast.error(
                `Failed to claim rewards: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        } finally {
            setClaimingCoinType(null);
        }
    }, [
        walletCoins,
        address,
        memezWalletAddress,
        signAndExecuteTransaction,
        fetchWalletCoins,
        setClaimingCoinType,
    ]);

    return { handleClaim, handleClaimAll };
};