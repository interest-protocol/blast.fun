import {
	FarmsSDK,
	toInterestAccount,
	toInterestFarm,
	type InterestAccount,
	type InterestFarm,
} from "@interest-protocol/farms"
import type { SuiGrpcClient } from "@mysten/sui/grpc"
import type { SuiJsonRpcClient } from "@mysten/sui/jsonRpc"
import type { SuiClientTypes } from "@mysten/sui/client"
import type { Transaction } from "@mysten/sui/transactions"
import { Network } from "@/types/network"

const STRUCT_TAG_PATTERN = /^(0x)?[0-9a-fA-F]{1,64}::\w+::\w+/

// @dev: The legacy farms SDK parsers (toInterestFarm/toInterestAccount) read the
// JSON-RPC MoveStruct shape where every nested struct is wrapped in { fields }
// and 0x1::type_name::TypeName is rendered as { fields: { name } }. The gRPC
// json representation returns plain nested objects and TypeName as a bare
// struct-tag string, so we rebuild both wrappers to keep the SDK parsers as the
// single source of truth.
function toLegacyMoveValue(value: unknown): unknown {
	if (Array.isArray(value)) return value.map(toLegacyMoveValue)

	if (value !== null && typeof value === "object") {
		const fields: Record<string, unknown> = {}
		for (const [key, entry] of Object.entries(value)) {
			fields[key] = toLegacyMoveValue(entry)
		}
		return { fields }
	}

	if (typeof value === "string" && STRUCT_TAG_PATTERN.test(value)) {
		return { fields: { name: value } }
	}

	return value
}

function toLegacyObjectResponse(object: SuiClientTypes.Object<{ json: true }>) {
	const content = toLegacyMoveValue(object.json ?? {}) as { fields: unknown }

	return {
		data: {
			objectId: object.objectId,
			version: object.version,
			digest: object.digest,
			type: object.type,
			content: {
				dataType: "moveObject",
				type: object.type,
				fields: content.fields,
			},
		},
	}
}

// @dev: Minimal JSON-RPC-shaped client backed by SuiGrpcClient. It is assigned to
// FarmsSDK's internal `client` so every read the legacy SDK performs (including
// the string-id paths inside stake/unstake/harvest builders) goes over gRPC.
// devInspect is the one deliberate exception, see below.
class FarmsLegacyClientShim {
	constructor(
		private readonly grpcClient: SuiGrpcClient,
		private readonly jsonRpcClient: SuiJsonRpcClient
	) {}

	async getObject({ id }: { id: string }) {
		const { object } = await this.grpcClient.getObject({
			objectId: id,
			include: { json: true },
		})

		return toLegacyObjectResponse(object)
	}

	async multiGetObjects({ ids }: { ids: string[] }) {
		const { objects } = await this.grpcClient.getObjects({
			objectIds: ids,
			include: { json: true },
		})

		return objects.map(object => {
			if (object instanceof Error) throw object
			return toLegacyObjectResponse(object)
		})
	}

	async getOwnedObjects({
		owner,
		filter,
		cursor,
		limit,
	}: {
		owner: string
		filter?: { Package?: string; StructType?: string }
		cursor?: string | null
		limit?: number
	}) {
		// @dev: gRPC ListOwnedObjects only accepts struct-type filters, not
		// package-only filters like the legacy JSON-RPC API
		if (filter && !filter.StructType) {
			throw new Error("FarmsLegacyClientShim: only StructType filters are supported over gRPC")
		}

		const response = await this.grpcClient.listOwnedObjects({
			owner,
			type: filter?.StructType,
			cursor,
			limit,
			include: { json: true },
		})

		return {
			data: response.objects.map(toLegacyObjectResponse),
			hasNextPage: response.hasNextPage,
			nextCursor: response.cursor,
		}
	}

	// @dev: Deliberate compatibility fallback to the official Sui fullnode
	// JSON-RPC API: interest_farm::pending_rewards is a private Move function,
	// only callable under devInspect semantics. gRPC SimulateTransaction
	// enforces Move visibility in @mysten/sui 2.6.0, so pending-reward
	// simulations cannot run over gRPC yet.
	async devInspectTransactionBlock(input: {
		transactionBlock: Transaction
		sender: string
	}) {
		return this.jsonRpcClient.devInspectTransactionBlock(input)
	}
}

export interface FarmsGrpcSDKArgs {
	network: Network
	grpcClient: SuiGrpcClient
	jsonRpcClient: SuiJsonRpcClient
}

// @dev: App-owned facade over the legacy FarmsSDK. Transaction construction stays
// in the legacy package (offline PTB building); every network read/simulation is
// routed through gRPC via the client shim. The read methods are overridden so the
// gRPC boundary is explicit and typed at the app level.
export class FarmsGrpcSDK extends FarmsSDK {
	private readonly grpcShim: FarmsLegacyClientShim

	constructor({ network, grpcClient, jsonRpcClient }: FarmsGrpcSDKArgs) {
		super({ network, fullNodeUrl: "grpc://unused" })

		this.grpcShim = new FarmsLegacyClientShim(grpcClient, jsonRpcClient)
		// @dev: Replace the JSON-RPC client the legacy SDK created internally
		this.client = this.grpcShim as unknown as FarmsSDK["client"]
	}

	override async getFarm(farmId: string): Promise<InterestFarm> {
		const object = await this.grpcShim.getObject({ id: farmId })
		return toInterestFarm(object)
	}

	override async getAccounts(owner: string): Promise<InterestAccount[]> {
		// @dev: All type-arg instantiations of the account struct are matched
		const accountType = `${this.packages.INTEREST_FARM.original}::${this.modules.FARM}::InterestFarmAccount`
		const accounts = []
		let cursor: string | null = null

		do {
			const page = await this.grpcShim.getOwnedObjects({
				owner,
				filter: { StructType: accountType },
				cursor,
				limit: 50,
			})

			accounts.push(...page.data.map(toInterestAccount))
			cursor = page.hasNextPage ? page.nextCursor : null
		} while (cursor)

		return accounts
	}

	override async idToInterestAccount(ids: string[]): Promise<InterestAccount[]> {
		const objects = await this.grpcShim.multiGetObjects({ ids })
		return objects.map(toInterestAccount)
	}
}
