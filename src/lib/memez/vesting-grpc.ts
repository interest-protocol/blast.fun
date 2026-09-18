import { MemezVestingSDK, type Vesting } from "@interest-protocol/memez-fun-sdk"
import type { SuiClientTypes } from "@mysten/sui/client"
import type { SuiGrpcClient } from "@mysten/sui/grpc"
import { normalizeStructTag, SUI_TYPE_ARG } from "@mysten/sui/utils"
import { listAllBalances } from "@/lib/sui-coins"
import type { Network } from "@/types/network"

// @dev: Upgrades change the callable package, but live objects retain this defining type.
export const VESTING_OBJECT_TYPE =
	"0xc0e8906f5e0dd114d5de1da7cda2ce7d58763b8d9da3af839fbe25e8c106d317::memez_soulbound_vesting::MemezSoulBoundVesting"

export interface VestingPage {
	data: Vesting[]
	hasNextPage: boolean
	nextCursor: string | null
}

export interface VestingCoinMetadata {
	id: string | null
	decimals: number
	name: string
	symbol: string
	description: string
	iconUrl: string | null
}

export interface VestingWalletCoin {
	coinType: string
	balance: string
	decimals: number
	symbol: string
	name: string
	iconUrl?: string
	price?: number
	value?: number
}

interface VestingGrpcSDKArgs {
	network: Network
	grpcClient: SuiGrpcClient
}

function getVestingCoinType(type: string): string {
	const match = /<(.+)>$/.exec(type)
	if (!match) throw new Error(`Invalid vesting type: ${type}`)

	return normalizeStructTag(match[1])
}

function getVestingField(
	json: Record<string, unknown> | null,
	field: "balance" | "released" | "start" | "duration" | "owner"
): string {
	const value = json?.[field]
	if (typeof value !== "string" && typeof value !== "number") {
		throw new Error(`Vesting object is missing ${field}`)
	}

	return String(value)
}

function parseGrpcVesting(object: SuiClientTypes.Object<{ json: true }>): Vesting {
	return {
		objectId: object.objectId,
		version: object.version,
		digest: object.digest,
		coinType: getVestingCoinType(object.type),
		balance: BigInt(getVestingField(object.json, "balance")),
		released: BigInt(getVestingField(object.json, "released")),
		start: BigInt(getVestingField(object.json, "start")),
		duration: BigInt(getVestingField(object.json, "duration")),
		owner: getVestingField(object.json, "owner"),
	}
}

function normalizeCoinMetadata(
	metadata: {
		id?: string | null
		decimals: number
		name: string
		symbol: string
		description: string
		iconUrl?: string | null
	} | null
): VestingCoinMetadata | null {
	if (!metadata) return null

	return {
		id: metadata.id ?? null,
		decimals: metadata.decimals,
		name: metadata.name,
		symbol: metadata.symbol,
		description: metadata.description,
		iconUrl: metadata.iconUrl ?? null,
	}
}

export class MemezVestingGrpcSDK extends MemezVestingSDK {
	constructor(private readonly args: VestingGrpcSDKArgs) {
		// @dev: Public fullnodes no longer serve JSON-RPC; every read below goes through gRPC.
		super({ network: args.network, fullNodeUrl: "grpc://unused" })
	}

	override async get(vesting: string): Promise<Vesting> {
		const { object } = await this.args.grpcClient.getObject({
			objectId: vesting,
			include: { json: true },
		})

		return parseGrpcVesting(object)
	}

	override async getMultiple(vestings: string[]): Promise<Vesting[]> {
		if (vestings.length === 0) return []

		const { objects } = await this.args.grpcClient.getObjects({
			objectIds: vestings,
			include: { json: true },
		})

		return objects.map((object) => {
			if (object instanceof Error) throw object
			return parseGrpcVesting(object)
		})
	}

	async getOwnedVestings({
		owner,
		cursor,
		limit = 20,
	}: {
		owner: string
		cursor?: string | null
		limit?: number
	}): Promise<VestingPage> {
		const response = await this.args.grpcClient.listOwnedObjects({
			owner,
			type: VESTING_OBJECT_TYPE,
			cursor,
			limit,
			include: { json: true },
		})

		return {
			data: response.objects.map(parseGrpcVesting),
			hasNextPage: response.hasNextPage,
			nextCursor: response.cursor,
		}
	}

	async getCoinMetadata(coinType: string): Promise<VestingCoinMetadata | null> {
		const { coinMetadata } = await this.args.grpcClient.getCoinMetadata({ coinType })

		return normalizeCoinMetadata(coinMetadata)
	}

	async getWalletCoins(owner: string): Promise<VestingWalletCoin[]> {
		const coins = (await listAllBalances(owner))
			.map((balance) => ({ coinType: normalizeStructTag(balance.coinType), balance: balance.balance }))
			.filter(({ balance }) => BigInt(balance) > 0n)
		const metadata = await Promise.all(coins.map(({ coinType }) => this.getCoinMetadata(coinType).catch(() => null)))

		return coins
			.map((coin, index) => {
				const coinMetadata = metadata[index]
				const fallbackSymbol = coin.coinType.split("::").pop() ?? "TOKEN"

				return {
					...coin,
					decimals: coinMetadata?.decimals ?? 9,
					symbol: coinMetadata?.symbol ?? fallbackSymbol,
					name: coinMetadata?.name ?? fallbackSymbol,
					iconUrl: coinMetadata?.iconUrl ?? undefined,
				}
			})
			.sort((a, b) => {
				const suiType = normalizeStructTag(SUI_TYPE_ARG)
				if (a.coinType === suiType) return -1
				if (b.coinType === suiType) return 1
				return a.symbol.localeCompare(b.symbol)
			})
	}
}
