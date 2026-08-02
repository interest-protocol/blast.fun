import {
	FarmsSDK,
	toInterestAccount,
	toInterestFarm,
	type InterestAccount,
	type InterestFarm,
} from "@interest-protocol/farms"
import { bcs } from "@mysten/sui/bcs"
import type { SuiClientTypes } from "@mysten/sui/client"
import type { SuiGraphQLClient } from "@mysten/sui/graphql"
import { Transaction } from "@mysten/sui/transactions"
import { normalizeStructTag } from "@mysten/sui/utils"
import { Network } from "@/types/network"

const STRUCT_TAG_PATTERN = /^(0x)?[0-9a-fA-F]{1,64}::\w+::\w+/
const DEV_INSPECT_SENDER = "0x7777777777777777777777777777777777777777777777777777777777777777"

// @dev: The legacy farms SDK parsers read nested JSON-RPC Move structs through
// `fields` wrappers. GraphQL returns plain JSON, so recreate that parser input
// shape while keeping every network request on the GraphQL client.
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

class FarmsLegacyClientShim {
	constructor(private readonly graphQLClient: SuiGraphQLClient) {}

	async getObject({ id }: { id: string }) {
		const { object } = await this.graphQLClient.getObject({
			objectId: id,
			include: { json: true },
		})

		return toLegacyObjectResponse(object)
	}

	async multiGetObjects({ ids }: { ids: string[] }) {
		const { objects } = await this.graphQLClient.getObjects({
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
		if (filter && !filter.StructType) {
			throw new Error("FarmsLegacyClientShim: only StructType filters are supported over GraphQL")
		}

		const response = await this.graphQLClient.listOwnedObjects({
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
}

type DevInspectSimulationOptions = SuiClientTypes.SimulateTransactionOptions<{
	commandResults: true
}> & { checksEnabled: false }

type DevInspectSimulationResult = SuiClientTypes.SimulateTransactionResult<{
	commandResults: true
}>

export interface FarmsGraphQLSDKArgs {
	network: Network
	graphQLClient: SuiGraphQLClient
}

export class FarmsGraphQLSDK extends FarmsSDK {
	private readonly graphQLClient: SuiGraphQLClient
	private readonly graphQLShim: FarmsLegacyClientShim

	constructor({ network, graphQLClient }: FarmsGraphQLSDKArgs) {
		super({ network, fullNodeUrl: "graphql://unused" })

		this.graphQLClient = graphQLClient
		this.graphQLShim = new FarmsLegacyClientShim(graphQLClient)
		this.client = this.graphQLShim as unknown as FarmsSDK["client"]
	}

	override async getFarm(farmId: string): Promise<InterestFarm> {
		const object = await this.graphQLShim.getObject({ id: farmId })
		return toInterestFarm(object)
	}

	override async getAccounts(owner: string): Promise<InterestAccount[]> {
		const accountType = `${this.packages.INTEREST_FARM.original}::${this.modules.FARM}::InterestFarmAccount`
		const accounts = []
		let cursor: string | null = null

		do {
			const page = await this.graphQLShim.getOwnedObjects({
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
		const objects = await this.graphQLShim.multiGetObjects({ ids })
		return objects.map(toInterestAccount)
	}

	override async pendingRewards(account: InterestAccount | string) {
		const resolvedAccount = typeof account === "string"
			? (await this.idToInterestAccount([account]))[0]
			: account

		if (!resolvedAccount) throw new Error(`Farm account ${account} was not found`)

		const rewardTypes = Object.keys(resolvedAccount.rewards)
		if (rewardTypes.length === 0) return []

		const tx = new Transaction()
		tx.setSender(DEV_INSPECT_SENDER)

		for (const rewardType of rewardTypes) {
			tx.moveCall({
				package: this.packages.INTEREST_FARM.latest,
				module: this.modules.FARM,
				function: "pending_rewards",
				arguments: [
					tx.object(resolvedAccount.objectId),
					tx.object(resolvedAccount.farm),
					tx.object.clock(),
				],
				typeArguments: [
					normalizeStructTag(resolvedAccount.stakeCoinType),
					normalizeStructTag(rewardType),
				],
			})
		}

		// @dev: `checksEnabled: false` preserves JSON-RPC devInspect semantics for
		// the farm's private, non-entry pending_rewards function.
		const simulateTransaction = this.graphQLClient.core.simulateTransaction.bind(
			this.graphQLClient.core
		) as (options: DevInspectSimulationOptions) => Promise<DevInspectSimulationResult>
		const result = await simulateTransaction({
			transaction: tx,
			checksEnabled: false,
			include: { commandResults: true },
		})

		if (result.FailedTransaction) {
			throw new Error(result.FailedTransaction.status.error?.message ?? "Pending rewards simulation failed")
		}

		return rewardTypes.map((rewardType, index) => {
			const output = result.commandResults[index]?.returnValues[0]?.bcs
			if (!output) throw new Error(`Pending reward simulation returned no value for ${rewardType}`)

			return {
				rewardType,
				amount: BigInt(bcs.U64.parse(output)),
			}
		})
	}
}
