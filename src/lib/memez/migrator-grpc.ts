import { Coin, XPumpMigratorSDK } from "@interest-protocol/memez-fun-sdk"
import { bcs } from "@mysten/sui/bcs"
import type { SuiClientTypes } from "@mysten/sui/client"
import type { SuiGrpcClient } from "@mysten/sui/grpc"
import { Transaction } from "@mysten/sui/transactions"
import { normalizeStructTag, normalizeSuiObjectId } from "@mysten/sui/utils"
import type { Network } from "@/types/network"

const DEV_INSPECT_SENDER = "0x7777777777777777777777777777777777777777777777777777777777777777"

// @dev: Parse the defining-type BCS so transport-specific Move JSON shapes cannot change these fields.
const PositionOwner = bcs.struct("PositionOwner", {
	id: bcs.Address,
	pool: bcs.Address,
	position: bcs.Address,
	meme: bcs.struct("TypeName", { name: bcs.string() }),
})

type GetPositionsArgs = Parameters<XPumpMigratorSDK["getPositions"]>[0]
type Position = Awaited<ReturnType<XPumpMigratorSDK["getPositions"]>>["positions"][number]
type PendingFeeArgs = Parameters<XPumpMigratorSDK["pendingFee"]>[0] & { owner?: string }

function parsePosition(object: SuiClientTypes.Object<{ content: true }>): Position {
	const position = PositionOwner.parse(object.content)

	return {
		objectId: normalizeSuiObjectId(object.objectId),
		version: object.version,
		digest: object.digest,
		type: normalizeStructTag(object.type),
		memeCoinType: normalizeStructTag(position.meme.name),
		blueFinPoolId: normalizeSuiObjectId(position.pool),
		blueFinPositionId: normalizeSuiObjectId(position.position),
	}
}

function getPositionOwnerId(positionOwner: PendingFeeArgs["positionOwner"]): string {
	if (typeof positionOwner === "string") return positionOwner

	if (typeof positionOwner === "object" && positionOwner !== null && "objectId" in positionOwner) {
		return String(positionOwner.objectId)
	}

	throw new Error("Pending fee simulation requires a position-owner object ID")
}

class MigratorLegacyClientShim {
	constructor(private readonly grpcClient: SuiGrpcClient) {}

	async getCoinMetadata({ coinType }: { coinType: string }) {
		const { coinMetadata } = await this.grpcClient.getCoinMetadata({ coinType })
		return coinMetadata
	}
}

interface MemezMigratorGrpcSDKArgs {
	network: Network
	grpcClient: SuiGrpcClient
}

export class MemezMigratorGrpcSDK extends XPumpMigratorSDK {
	private readonly grpcClient: SuiGrpcClient

	constructor({ network, grpcClient }: MemezMigratorGrpcSDKArgs) {
		super({ network, fullNodeUrl: "grpc://unused" })

		this.grpcClient = grpcClient
		this.client = new MigratorLegacyClientShim(grpcClient) as unknown as XPumpMigratorSDK["client"]
	}

	override async getPositions({
		owner,
		cursor = null,
		limit = 50,
	}: GetPositionsArgs): ReturnType<XPumpMigratorSDK["getPositions"]> {
		const response = await this.grpcClient.listOwnedObjects({
			owner,
			type: this.positionOwnerType,
			cursor,
			limit: limit ?? 50,
			include: { content: true },
		})

		return {
			hasNextPage: response.hasNextPage,
			nextCursor: response.cursor,
			positions: response.objects.map(parsePosition),
		}
	}

	override async pendingFee({ bluefinPool, memeCoinType, positionOwner, owner }: PendingFeeArgs): Promise<string> {
		const positionOwnerId = getPositionOwnerId(positionOwner)
		const sender = owner ?? (await this.getPositionOwnerAddress(positionOwnerId))
		const { tx, suiCoin } = this.collectFee({
			bluefinPool,
			memeCoinType,
			positionOwner,
		})

		tx.setSender(sender)
		// @dev: gRPC simulation rejects an unused Coin result, so consume it in the simulated transaction.
		tx.transferObjects([suiCoin], tx.pure.address(sender))

		const result = await this.grpcClient.simulateTransaction({
			transaction: tx,
			include: { commandResults: true },
		})

		if (result.$kind === "FailedTransaction") {
			throw new Error(result.FailedTransaction.status.error?.message ?? "Pending fee simulation failed")
		}

		const output = result.commandResults[0]?.returnValues[0]?.bcs
		if (!output) throw new Error("Pending fee simulation returned no value")

		return Coin.parse(output).value
	}

	override async getPositionDataOwner(memeCoinType: string): Promise<string> {
		const tx = new Transaction()
		tx.setSender(DEV_INSPECT_SENDER)
		tx.moveCall({
			package: this.packageId,
			module: this.module,
			function: "position_data_owner",
			typeArguments: [normalizeStructTag(memeCoinType)],
			arguments: [tx.sharedObjectRef(this.sharedObjects.XPUMP_MIGRATOR_CONFIG({ mutable: false }))],
		})

		const result = await this.grpcClient.simulateTransaction({
			transaction: tx,
			include: { commandResults: true },
		})

		if (result.$kind === "FailedTransaction") {
			throw new Error(result.FailedTransaction.status.error?.message ?? "Position data owner simulation failed")
		}

		const output = result.commandResults[0]?.returnValues[0]?.bcs
		if (!output) throw new Error("Position data owner simulation returned no value")

		return normalizeSuiObjectId(bcs.Address.parse(output))
	}

	private async getPositionOwnerAddress(positionOwnerId: string): Promise<string> {
		const { object } = await this.grpcClient.getObject({ objectId: positionOwnerId })

		if (object.owner.$kind !== "AddressOwner") {
			throw new Error(`Position owner ${positionOwnerId} is not address-owned`)
		}

		return object.owner.AddressOwner
	}
}
