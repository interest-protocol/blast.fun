import type { SuiClientTypes } from "@mysten/sui/client"
import { suiGrpcClient } from "@/lib/sui-grpc"

const PAGE_SIZE = 50

// @dev: Walks every page of a coin-type balance listing for an owner.
export async function listAllBalances(owner: string): Promise<SuiClientTypes.Balance[]> {
	const balances: SuiClientTypes.Balance[] = []
	let cursor: string | null = null

	do {
		const page = await suiGrpcClient.listBalances({ owner, cursor, limit: PAGE_SIZE })
		balances.push(...page.balances)
		cursor = page.hasNextPage ? page.cursor : null
	} while (cursor)

	return balances
}

// @dev: Walks every page of coin objects of one type for an owner.
export async function listAllCoins(owner: string, coinType: string): Promise<SuiClientTypes.Coin[]> {
	const coins: SuiClientTypes.Coin[] = []
	let cursor: string | null = null

	do {
		const page = await suiGrpcClient.listCoins({ owner, coinType, cursor, limit: PAGE_SIZE })
		coins.push(...page.objects)
		cursor = page.hasNextPage ? page.cursor : null
	} while (cursor)

	return coins
}
