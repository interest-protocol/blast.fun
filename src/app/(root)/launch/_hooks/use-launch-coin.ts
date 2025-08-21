import { invariant } from "@apollo/client/utilities/globals"
import { CONFIG_KEYS, MIGRATOR_WITNESSES, Modules, PACKAGES } from "@interest-protocol/memez-fun-sdk"
import { coinWithBalance, Transaction } from "@mysten/sui/transactions"
import {
	formatAddress,
	formatDigest,
	isValidSuiAddress,
	normalizeStructTag,
	normalizeSuiAddress,
	SUI_TYPE_ARG,
} from "@mysten/sui/utils"
import { useState } from "react"
import { useConfetti } from "@/components/shared/confetti"
import {
	BASE_LIQUIDITY_PROVISION,
	COIN_CONVENTION_BLACKLIST,
	TARGET_QUOTE_LIQUIDITY,
	TOTAL_POOL_SUPPLY,
	VIRTUAL_LIQUIDITY,
} from "@/constants"
import { useApp } from "@/context/app.context"
import { useTwitter } from "@/context/twitter.context"
import { env } from "@/env"
import { useTransaction } from "@/hooks/sui/use-transaction"
import { getBytecode } from "@/lib/move-template/coin"
import initMoveByteCodeTemplate from "@/lib/move-template/move-bytecode-template"
import { pumpSdk } from "@/lib/pump"
import { getCreatedObjectByType, getTxExplorerUrl } from "@/utils/transaction"
import { TokenFormValues } from "../_components/create-token-form"

interface LaunchResult {
	treasuryCapObjectId: string
	tokenTxDigest: string
	poolObjectId: string
	poolTxDigest: string
}

export interface LogEntry {
	timestamp: string
	message: string
	type: "info" | "success" | "error" | "warning"
}

export function useLaunchCoin() {
	const [isLaunching, setIsLaunching] = useState(false)
	const [logs, setLogs] = useState<LogEntry[]>([])
	const [result, setResult] = useState<LaunchResult | null>(null)
	const [pendingToken, setPendingToken] = useState<{
		treasuryCapObjectId: string
		txDigest: string
		formValues: TokenFormValues
	} | null>(null)

	const { isLoggedIn, user: twitterUser } = useTwitter()
	const { isConnected, address } = useApp()
	const { executeTransaction } = useTransaction()
	const { confettiPlayer } = useConfetti()

	const addLog = (message: string, type: LogEntry["type"] = "info") => {
		const timestamp = new Date().toLocaleTimeString("en-US", {
			hour12: false,
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		})
		setLogs((prev) => [...prev, { timestamp, message, type }])
	}

	const createToken = async (
		formValues: TokenFormValues
	): Promise<{ treasuryCapObjectId: string; time: number; txDigest: string }> => {
		if (!isConnected || !address) {
			throw new Error("Please connect your wallet")
		}

		if (!isLoggedIn || !twitterUser) {
			throw new Error("Please connect your X account")
		}

		const nameUpper = formValues.name.toUpperCase().trim()
		const symbolUpper = formValues.symbol.toUpperCase().trim()

		if (COIN_CONVENTION_BLACKLIST.includes(nameUpper) || COIN_CONVENTION_BLACKLIST.includes(symbolUpper)) {
			throw new Error("This name or symbol is not allowed")
		}

		addLog("INITIALIZING::WASM_MODULE")
		await initMoveByteCodeTemplate("/bytecode/move_bytecode_template_bg.wasm")
		addLog("COMPILING::BYTECODE")

		const tx = new Transaction()
		const bytecode = await getBytecode(formValues, address)
		const [upgradeCap] = tx.publish({
			modules: [[...bytecode]],
			dependencies: [normalizeSuiAddress("0x1"), normalizeSuiAddress("0x2")],
		})

		tx.moveCall({
			target: "0x2::package::make_immutable",
			arguments: [upgradeCap],
		})

		addLog("SIGNING::TRANSACTION")
		const result = await executeTransaction(tx)
		addLog(`CONTRACT::DEPLOYED [${result.time}MS]`, "success")

		const treasuryCapObjectId = getCreatedObjectByType(result, "::coin::TreasuryCap")
		if (!treasuryCapObjectId) {
			throw new Error(
				`Failed to find treasury cap in transaction ${formatDigest(result.digest)}. ` +
					`View transaction: ${getTxExplorerUrl(result.digest)}`
			)
		}

		return {
			treasuryCapObjectId,
			time: result.time,
			txDigest: result.digest,
		}
	}

	const createPool = async (
		treasuryCapObjectId: string,
		formValues: TokenFormValues
	): Promise<{ poolObjectId: string; time: number; txDigest: string }> => {
		if (!pumpSdk) {
			throw new Error("Pump SDK not initialized")
		}

		if (!address) {
			throw new Error("No wallet address found")
		}

		const network = pumpSdk.network as "mainnet" | "testnet"
		const configKey = CONFIG_KEYS[network]?.XPUMP
		const migrationWitness = MIGRATOR_WITNESSES[network]?.XPUMP

		if (!configKey || !migrationWitness) {
			throw new Error(`Invalid network configuration for ${network}`)
		}

		// construct our metadata object which will be applied to the pool.
		const metadata = Object.entries({
			CreatorTwitterId: !formValues.hideIdentity && twitterUser?.id,
			CreatorTwitterName: !formValues.hideIdentity && twitterUser?.username,
			X: formValues.twitter,
			Telegram: formValues.telegram,
			Website: formValues.website,
		}).reduce(
			(acc, [key, value]) => {
				if (value) acc[key] = value
				return acc
			},
			{} as Record<string, string>
		)

		// should pool be protected based on sniper protection toggle
		const isProtected = formValues.sniperProtection

		const { memeCoinType } = await pumpSdk.getCoinMetadataAndType(treasuryCapObjectId)

		const tx = new Transaction();

		const firstPurchase = formValues.devBuyAmount
				? coinWithBalance({
						balance: parseFloat(formValues.devBuyAmount || "0") * 10 ** 9,
						type: "0x2::sui::SUI",
					})
				: pumpSdk.zeroSuiCoin(tx)

		const { metadataCap, firstBuy } = await pumpSdk.newPoolWithFirstBuy({
			tx,
			configurationKey: configKey,
			metadata,
			memeCoinTreasuryCap: treasuryCapObjectId,
			migrationWitness: migrationWitness,
			totalSupply: TOTAL_POOL_SUPPLY,
			isProtected,
			developer: address,
			quoteCoinType: SUI_TYPE_ARG,
			burnTax: 0,
			virtualLiquidity: VIRTUAL_LIQUIDITY,
			targetQuoteLiquidity: TARGET_QUOTE_LIQUIDITY,
			liquidityProvision: BASE_LIQUIDITY_PROVISION,
			firstPurchase,
		})

		tx.transferObjects([firstBuy], tx.pure.address(address))
		
		if (metadataCap) {
			tx.transferObjects([metadataCap], tx.pure.address(address))
		}

		addLog("POOL::TRANSACTION::SIGNING")
		const result = await executeTransaction(tx)
		addLog(`POOL::CREATED [${result.time}MS]`, "success")

		const poolObjectId = getCreatedObjectByType(result, "::memez_pump::Pump,")
		if (!poolObjectId) {
			throw new Error(
				`Failed to find pool object in transaction ${formatDigest(result.digest)}. ` +
					`View transaction: ${getTxExplorerUrl(result.digest)}`
			)
		}

		return {
			poolObjectId,
			time: result.time,
			txDigest: result.digest,
		}
	}

	const saveLaunchData = async (launchData: {
		poolObjectId: string
		tokenTxHash: string
		poolTxHash: string
		hideIdentity: boolean
		protectionSettings?: {
			requireTwitter: boolean
			revealTraderIdentity: boolean
			minFollowerCount?: string
			maxHoldingPercent?: string
		}
	}): Promise<void> => {
		try {
			const response = await fetch("/api/launches", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					poolObjectId: launchData.poolObjectId,
					creatorAddress: address,
					twitterUserId: twitterUser?.id,
					twitterUsername: twitterUser?.username,
					hideIdentity: launchData.hideIdentity,
					tokenTxHash: launchData.tokenTxHash,
					poolTxHash: launchData.poolTxHash,
					protectionSettings: launchData.protectionSettings,
				}),
			})

			if (!response.ok) {
				throw new Error("Failed to save launch data")
			}
		} catch (error) {
			console.error("Failed to save launch data:", error)
		}
	}

	const launchToken = async (formValues: TokenFormValues): Promise<LaunchResult> => {
		setIsLaunching(true)
		setLogs([])
		setResult(null)

		addLog("SYSTEM::INITIALIZATION", "info")
		addLog(`IDENTITY::${formValues.hideIdentity ? "[REDACTED]" : twitterUser?.username || address}`)
		addLog(`TOKEN::${formValues.symbol.toUpperCase()}`)

		try {
			const tokenResult = await createToken(formValues)
			addLog(`TREASURY::CAP::${formatAddress(tokenResult.treasuryCapObjectId)}`)

			// store pending token info in case pool creation fails
			setPendingToken({
				treasuryCapObjectId: tokenResult.treasuryCapObjectId,
				txDigest: tokenResult.txDigest,
				formValues,
			})

			addLog("POOL::INITIALIZATION")
			const poolResult = await createPool(tokenResult.treasuryCapObjectId, formValues)
			addLog(`POOL::ID::${formatAddress(poolResult.poolObjectId)}`)

			addLog("CLEANING::UP", "info")

			// save token launch data now
			const protectionSettings = formValues.sniperProtection
				? {
						sniperProtection: true,
						requireTwitter: formValues.requireTwitter,
						revealTraderIdentity: formValues.revealTraderIdentity,
						minFollowerCount: formValues.minFollowerCount,
						maxHoldingPercent: formValues.maxHoldingPercent,
					}
				: undefined

			await saveLaunchData({
				poolObjectId: poolResult.poolObjectId,
				tokenTxHash: tokenResult.txDigest,
				poolTxHash: poolResult.txDigest,
				hideIdentity: formValues.hideIdentity,
				protectionSettings,
			})

			const launchResult = {
				treasuryCapObjectId: tokenResult.treasuryCapObjectId,
				tokenTxDigest: tokenResult.txDigest,
				poolObjectId: poolResult.poolObjectId,
				poolTxDigest: poolResult.txDigest,
			}

			setResult(launchResult)
			confettiPlayer.current("Confetti from left and right")
			addLog("LAUNCH::COMPLETE", "success")

			// clear pending token on success
			setPendingToken(null)

			return launchResult
		} catch (error) {
			addLog(`ERROR::${error instanceof Error ? error.message.toUpperCase() : "UNKNOWN"}`, "error")

			// if pool creation failed but we have a treasury cap, show recovery option
			if (pendingToken) {
				addLog("RECOVERY::AVAILABLE - Treasury cap saved for retry", "warning")
			}

			throw error
		} finally {
			setTimeout(() => {
				setIsLaunching(false)
			}, 3000)
		}
	}

	const resumeLaunch = async (): Promise<LaunchResult> => {
		if (!pendingToken) {
			throw new Error("No pending launch to resume")
		}

		setIsLaunching(true)
		setLogs([])
		setResult(null)

		addLog("RESUMING::LAUNCH", "info")
		addLog(`TREASURY::CAP::${formatAddress(pendingToken.treasuryCapObjectId)}`)
		addLog(`TOKEN::${pendingToken.formValues.symbol.toUpperCase()}`)

		try {
			addLog("POOL::INITIALIZATION::RETRY")
			const poolResult = await createPool(pendingToken.treasuryCapObjectId, pendingToken.formValues)
			addLog(`POOL::ID::${formatAddress(poolResult.poolObjectId)}`)

			addLog("CLEANING::UP", "info")

			const protectionSettings = pendingToken.formValues.sniperProtection
				? {
						sniperProtection: true,
						requireTwitter: pendingToken.formValues.requireTwitter,
						revealTraderIdentity: pendingToken.formValues.revealTraderIdentity,
						minFollowerCount: pendingToken.formValues.minFollowerCount,
						maxHoldingPercent: pendingToken.formValues.maxHoldingPercent,
					}
				: undefined

			await saveLaunchData({
				poolObjectId: poolResult.poolObjectId,
				tokenTxHash: pendingToken.txDigest,
				poolTxHash: poolResult.txDigest,
				hideIdentity: pendingToken.formValues.hideIdentity,
				protectionSettings,
			})

			const launchResult = {
				treasuryCapObjectId: pendingToken.treasuryCapObjectId,
				tokenTxDigest: pendingToken.txDigest,
				poolObjectId: poolResult.poolObjectId,
				poolTxDigest: poolResult.txDigest,
			}

			setResult(launchResult)
			confettiPlayer.current("Confetti from left and right")
			addLog("LAUNCH::COMPLETE", "success")

			// clear pending token on success
			setPendingToken(null)

			return launchResult
		} catch (error) {
			addLog(`ERROR::${error instanceof Error ? error.message.toUpperCase() : "UNKNOWN"}`, "error")
			addLog("RECOVERY::STILL_AVAILABLE", "warning")
			throw error
		} finally {
			setTimeout(() => {
				setIsLaunching(false)
			}, 3000)
		}
	}

	return {
		isLaunching,
		logs,
		result,
		launchToken,
		resumeLaunch,
		pendingToken,
		addLog,
	}
}

async function newPoolAndBuy({
	tx = new Transaction(),
	creationSuiFee = pumpSdk.zeroSuiCoin(tx),
	memeCoinTreasuryCap,
	totalSupply = pumpSdk.defaultSupply,
	isProtected = false,
	developer,
	firstPurchase = pumpSdk.zeroSuiCoin(tx),
	buyAfterPoolCreation = pumpSdk.zeroSuiCoin(tx),
	metadata = {},
	configurationKey,
	migrationWitness,
	stakeHolders = [],
	quoteCoinType,
	burnTax = 0,
	virtualLiquidity,
	targetQuoteLiquidity,
	liquidityProvision = 0,
}: any) {
	invariant(burnTax >= 0 && burnTax <= pumpSdk.MAX_BPS, "burnTax must be between 0 and 10_000")
	invariant(
		liquidityProvision >= 0 && liquidityProvision <= pumpSdk.MAX_BPS,
		"liquidityProvision must be between 0 and 10_000"
	)

	invariant(BigInt(totalSupply) > 0n, "totalSupply must be greater than 0")
	invariant(isValidSuiAddress(developer), "developer must be a valid Sui address")

	invariant(
		stakeHolders.every((stakeHolder: any) => isValidSuiAddress(stakeHolder)),
		"stakeHolders must be a valid Sui address"
	)

	pumpSdk.assertNotZeroAddress(developer)

	const { memeCoinType, coinMetadataId } = await pumpSdk.getCoinMetadataAndType(memeCoinTreasuryCap)

	const memezMetadata = tx.moveCall({
		package: pumpSdk.packages.MEMEZ_FUN.latest,
		module: pumpSdk.modules.METADATA,
		function: "new",
		arguments: [
			tx.object(coinMetadataId),
			tx.pure.vector("string", Object.keys(metadata)),
			tx.pure.vector("string", Object.values(metadata)),
		],
		typeArguments: [normalizeStructTag(memeCoinType)],
	})

	const pumpConfig = tx.moveCall({
		package: pumpSdk.packages.MEMEZ_FUN.latest,
		module: pumpSdk.modules.PUMP_CONFIG,
		function: "new",
		arguments: [
			tx.pure.vector("u64", [burnTax, virtualLiquidity, targetQuoteLiquidity, liquidityProvision, totalSupply]),
		],
	})

	const [pool, metadataCap] = tx.moveCall({
		package: pumpSdk.packages.MEMEZ_FUN.latest,
		module: pumpSdk.modules.PUMP,
		function: "new",
		arguments: [
			tx.sharedObjectRef(pumpSdk.sharedObjects.CONFIG({ mutable: false })),
			pumpSdk.ownedObject(tx, memeCoinTreasuryCap),
			pumpSdk.ownedObject(tx, creationSuiFee),
			pumpConfig,
			pumpSdk.ownedObject(tx, firstPurchase),
			memezMetadata,
			tx.pure.vector("address", stakeHolders),
			tx.pure.bool(isProtected),
			tx.pure.address(developer),
			pumpSdk.getVersion(tx),
		],
		typeArguments: [
			normalizeStructTag(memeCoinType),
			normalizeStructTag(quoteCoinType),
			normalizeStructTag(configurationKey),
			normalizeStructTag(migrationWitness),
		],
	})

	const memeCoin = tx.moveCall({
		package: pumpSdk.packages.MEMEZ_FUN.latest,
		module: pumpSdk.modules.PUMP,
		function: "pump",
		arguments: [
			pool,
			pumpSdk.ownedObject(tx, buyAfterPoolCreation),
			tx.pure.option("address", null),
			tx.pure.option("vector<u8>", null),
			tx.pure.u64(0),
			pumpSdk.getVersion(tx),
		],
		typeArguments: [pool.memeCoinType, pool.quoteCoinType],
	})

	tx.transferObjects([memeCoin], tx.pure.address(developer))

	invariant(pool, "Pool not returned from new")

	tx.moveCall({
		package: "0x2",
		module: "transfer",
		function: "public_share_object",
		arguments: [pool],
		typeArguments: [
			`${pumpSdk.packages.MEMEZ_FUN.original}::memez_fun::MemezFun<${pumpSdk.packages.MEMEZ_FUN.original}::memez_pump::Pump, ${normalizeStructTag(memeCoinType)},${normalizeStructTag(quoteCoinType)}>`,
		],
	})

	return {
		metadataCap,
		tx,
	}
}
