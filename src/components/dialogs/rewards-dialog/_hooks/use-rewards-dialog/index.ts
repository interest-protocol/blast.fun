"use client";

import { useEffect, useState, useCallback } from "react";
import { useApp } from "@/context/app.context";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";

import type { WalletCoin } from "@/types/blockvision";
import { fetchWalletCoins } from "./helpers/fetch-wallet-coins";
import { useClaimHandlers } from "./helpers/use-claim-handlers";
import { fetchMemezWallet } from "./helpers/fetch-memez-wallet";

export const useRewardsDialog= (open: boolean) => {
  const { address, isConnected } = useApp();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const [walletCoins, setWalletCoins] = useState<WalletCoin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [claimingCoinType, setClaimingCoinType] = useState<string | null>(null);
  const [memezWalletAddress, setMemezWalletAddress] = useState<string | null>(null);

  const refreshCoins = useCallback(() => {
    if (memezWalletAddress) {
      fetchWalletCoins(memezWalletAddress, setWalletCoins, setIsLoading);
    }
  }, [memezWalletAddress]);

  const { handleClaim, handleClaimAll } = useClaimHandlers(
    address!,
    memezWalletAddress,
    walletCoins,
    signAndExecuteTransaction,
    refreshCoins,
    setClaimingCoinType
  );

  useEffect(() => {
    if (isConnected && address && open) {
      fetchMemezWallet(address, setMemezWalletAddress);
    }
  }, [isConnected, address, open]);

  useEffect(() => {
    if (memezWalletAddress && open) {
      refreshCoins();
    }
  }, [memezWalletAddress, open, refreshCoins]);

  return {
    walletCoins,
    isLoading,
    claimingCoinType,
    handleClaim,
    handleClaimAll,
  };
};