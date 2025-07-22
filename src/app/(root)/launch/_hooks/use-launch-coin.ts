import { CONFIG_KEYS, MIGRATOR_WITNESSES } from "@interest-protocol/memez-fun-sdk"
import { Transaction } from "@mysten/sui/transactions"
import { formatAddress, formatDigest, normalizeSuiAddress, SUI_TYPE_ARG } from "@mysten/sui/utils"
import { useState } from "react"
import { COIN_CONVENTION_BLACKLIST, TARGET_QUOTE_LIQUIDITY, TOTAL_POOL_SUPPLY, VIRTUAL_LIQUIDITY } from "@/constants"
import { HIDE_IDENTITY_SUI_FEE } from "@/constants/fees"
import { useApp } from "@/context/app.context"
import { useTwitter } from "@/context/twitter.context"
import { env } from "@/env"
import { useTransaction } from "@/hooks/sui/use-transaction"
import { getBytecode } from "@/lib/move-template/coin"
import initMoveByteCodeTemplate from "@/lib/move-template/move-bytecode-template"
import { pumpSdk } from "@/lib/pump"
import { getCreatedObjectByType, getTxExplorerUrl } from "@/utils/transaction"
import { TokenFormValues } from "../_components/create-token-form"
import { useConfetti } from "@/components/shared/confetti"

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
			throw new Error("Please connect your Twitter account")
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

		if (formValues.hideIdentity) {
			const [feeCoin] = tx.splitCoins(tx.gas, [String(HIDE_IDENTITY_SUI_FEE)])
			tx.transferObjects([feeCoin], tx.pure.address(env.NEXT_PUBLIC_FEE_ADDRESS))
		}

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
		const configKey = CONFIG_KEYS[network]?.MEMEZ
		const migrationWitness = MIGRATOR_WITNESSES[network]?.TEST

		if (!configKey || !migrationWitness) {
			throw new Error(`Invalid network configuration for ${network}`)
		}

		// construct our metadata object which will be applied to the pool.
		const metadata = Object.entries({
			CreatorWallet: address,
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

		const { tx, metadataCap } = await pumpSdk.newPool({
			configurationKey: configKey,
			metadata,
			memeCoinTreasuryCap: treasuryCapObjectId,
			migrationWitness: migrationWitness,
			totalSupply: TOTAL_POOL_SUPPLY,
			useTokenStandard: false,
			quoteCoinType: SUI_TYPE_ARG,
			burnTax: 0,
			virtualLiquidity: VIRTUAL_LIQUIDITY,
			targetQuoteLiquidity: TARGET_QUOTE_LIQUIDITY,
			liquidityProvision: 0,
		})

		if (metadataCap) {
			tx.transferObjects([metadataCap], tx.pure.address(address))
		}

		addLog("POOL::TRANSACTION::SIGNING")
		const result = await executeTransaction(tx)
		addLog(`POOL::CREATED [${result.time}MS]`, "success")

		const poolObjectId = getCreatedObjectByType(result, "::memez_pump::Pump")

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
	}): Promise<void> => {
		try {
			const response = await fetch("/api/launches", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					poolObjectId: launchData.poolObjectId,
					creatorAddress: address,
					twitterUserId: twitterUser?.id || null,
					twitterUsername: twitterUser?.username || null,
					hideIdentity: launchData.hideIdentity,
					tokenTxHash: launchData.tokenTxHash,
					poolTxHash: launchData.poolTxHash,
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

			addLog("POOL::INITIALIZATION")
			const poolResult = await createPool(tokenResult.treasuryCapObjectId, formValues)
			addLog(`POOL::ID::${formatAddress(poolResult.poolObjectId)}`)

			addLog("DATABASE::SYNC")
			await saveLaunchData({
				poolObjectId: poolResult.poolObjectId,
				tokenTxHash: tokenResult.txDigest,
				poolTxHash: poolResult.txDigest,
				hideIdentity: formValues.hideIdentity,
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

			return launchResult
		} catch (error) {
			addLog(`ERROR::${error instanceof Error ? error.message.toUpperCase() : "UNKNOWN"}`, "error")
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
		addLog,
	}
}
