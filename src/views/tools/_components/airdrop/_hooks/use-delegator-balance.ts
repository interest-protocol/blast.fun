import { useCallback, useEffect, useState } from "react";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { CoinBalance } from "@mysten/sui/jsonRpc";
import { suiClient } from "@/lib/sui-client";
import { DELEGATOR_KEY_STORAGE } from "../airdrop.consts";

export function useDelegatorBalance() {
	const [balances, setBalances] = useState<CoinBalance[]>([]);
	const [loading, setLoading] = useState(false);

	const getDelegatorAddress = (): string | null => {
		const storedKey = localStorage.getItem(DELEGATOR_KEY_STORAGE);
		if (!storedKey) return null;
		return Ed25519Keypair.fromSecretKey(storedKey).getPublicKey().toSuiAddress();
	};

	const fetchBalances = useCallback(async () => {
		const delegatorAddr = getDelegatorAddress();
		if (!delegatorAddr) {
			setBalances([]);
			return;
		}

		setLoading(true);
		try {
			const allBalances = await suiClient.getAllBalances({
				owner: delegatorAddr,
			});

			setBalances(allBalances.filter((b) => BigInt(b.totalBalance) > 0n));
		} catch (error) {
			console.error("Error fetching delegator balances:", error);
			setBalances([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchBalances();
	}, [fetchBalances]);

	return {
		delegatorHasAssets: balances.length > 0,
		delegatorBalances: balances,
		loading,
		refetchBalances: fetchBalances,
	};
}
