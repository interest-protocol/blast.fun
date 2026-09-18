import { PACKAGES, Modules } from "@interest-protocol/memez-fun-sdk"
import { Transaction } from "@mysten/sui/transactions"
import { bcs } from "@mysten/sui/bcs"
import { normalizeSuiAddress, normalizeStructTag } from "@mysten/sui/utils"
import { suiGrpcClient } from "@/lib/sui-grpc"
import { pumpSdk } from "./sdk"

export interface GetNonceArgs {
	poolId: string
	address: string
	curveType: string
	memeCoinType: string
	quoteCoinType: string
}

export interface GetNonceFromPoolArgs {
	poolId: string
	address: string
}

/**
 * Get the next nonce for a user from a MemezFun pool
 */
export async function getNextNonce({
	poolId,
	address,
	curveType,
	memeCoinType,
	quoteCoinType
}: GetNonceArgs): Promise<bigint> {
	const tx = new Transaction()
	tx.moveCall({
		package: PACKAGES[pumpSdk.network].MEMEZ_FUN.latest,
		module: Modules.FUN,
		function: 'next_nonce',
		arguments: [
			tx.object(poolId),
			tx.pure.address(address)
		],
		typeArguments: [
			normalizeStructTag(curveType),
			normalizeStructTag(memeCoinType),
			normalizeStructTag(quoteCoinType)
		],
	})

	tx.setSender(normalizeSuiAddress(address))

	const result = await suiGrpcClient.simulateTransaction({
		transaction: tx,
		include: { commandResults: true },
	})

	if (result.$kind === "FailedTransaction") {
		throw new Error(result.FailedTransaction.status.error?.message ?? "Failed to get nonce from contract")
	}

	const returnValue = result.commandResults[0]?.returnValues[0]?.bcs
	if (!returnValue) {
		throw new Error("No return value from next_nonce function")
	}

	// parse the returned u64 value
	const nonce = bcs.u64().parse(returnValue)
	return BigInt(nonce)
}

/**
 * Get the next nonce by fetching pool type information first
 */
export async function getNextNonceFromPool({
	poolId,
	address
}: GetNonceFromPoolArgs): Promise<bigint> {
	const poolData = await pumpSdk.getPumpPool(poolId)

	if (!poolData) {
		throw new Error("Failed to fetch pool data")
	}

	return getNextNonce({
		poolId,
		address,
		curveType: poolData.curveType,
		memeCoinType: poolData.memeCoinType,
		quoteCoinType: poolData.quoteCoinType
	})
}