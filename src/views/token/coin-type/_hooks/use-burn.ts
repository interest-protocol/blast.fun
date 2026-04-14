"use client";

import { useState } from "react";
import { useApp } from "@/context/app.context";
import { useTransaction } from "@/hooks/sui/use-transaction";
import { Transaction, coinWithBalance } from "@mysten/sui/transactions";
import { isValidSuiObjectId } from "@mysten/sui/utils";
import { pumpSdk } from "@/lib/memez/sdk";
import BigNumber from "bignumber.js";
import type { Token } from "@/types/token";

interface UseBurnParams {
	pool: Token;
	decimals: number;
	actualBalance: string | undefined;
	onSuccess?: () => void;
}

export function useBurn({ pool, decimals, actualBalance, onSuccess }: UseBurnParams) {
	const [isProcessing, setIsProcessing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { address } = useApp();
	const { executeTransaction } = useTransaction();

	const burn = async (amount: string) => {
		if (!amount || parseFloat(amount) <= 0) {
			setError("Please enter a valid amount");
			return false;
		}

		if (!address) {
			setError("Please connect your wallet");
			return false;
		}

		setIsProcessing(true);
		setError(null);

		try {
			const poolId = pool.pool?.poolId || pool.poolId || pool.id;
			if (!poolId || !isValidSuiObjectId(poolId)) {
				setError("Pool not found for this token");
				return false;
			}

			const poolOnChain = await pumpSdk.getPumpPool(poolId);
			const ipxTreasury = poolOnChain?.ipxMemeCoinTreasury;
			if (!ipxTreasury || !isValidSuiObjectId(ipxTreasury)) {
				setError("Burn is not available for this token (missing treasury).");
				return false;
			}

			// @dev: Calculate amount in smallest unit for burn transaction
			const amountBN = new BigNumber(amount);
			const amountInSmallestUnit = amountBN.multipliedBy(Math.pow(10, decimals)).toFixed(0);
			const burnAmount = BigInt(amountInSmallestUnit);

			const tx = new Transaction();
			tx.setSender(address);
			const memeCoin = coinWithBalance({
				type: pool.coinType,
				balance: burnAmount,
			})(tx);

			// @dev: Create and execute burn transaction
			const { tx: burnTx } = pumpSdk.burnMeme({
				tx,
				ipxTreasury,
				memeCoin,
				coinType: pool.coinType,
			});

			const result = await executeTransaction(burnTx);

			if (onSuccess) {
				onSuccess();
			}

			return result.digest;
		} catch (err) {
			console.error("Burn error:", err);
			const errorMessage = err instanceof Error ? err.message : "Failed to burn tokens";
			setError(errorMessage);
			return false;
		} finally {
			setIsProcessing(false);
		}
	};

	return {
		burn,
		isProcessing,
		error,
		setError,
	};
}
