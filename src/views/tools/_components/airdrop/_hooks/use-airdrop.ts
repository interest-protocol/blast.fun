import { useState, useEffect } from "react"
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519"
import { coinWithBalance, Transaction } from "@mysten/sui/transactions"
import { CoinMetadata } from "@mysten/sui/client"
import { SUI_DECIMALS, SUI_TYPE_ARG } from "@mysten/sui/utils"
import { suiClient } from "@/lib/sui-client"
import { useTransaction } from "@/hooks/sui/use-transaction"
import toast from "react-hot-toast"
import { BATCH_SIZE, GAS_PER_RECIPIENT, SERVICE_FEE_PER_RECIPIENT, DELEGATOR_KEY_STORAGE } from "../airdrop.consts"
import { AirdropRecipient } from "../airdrop-tools/airdrop-tools.types"
interface UseAirdropParams {
	address: string | null | undefined
	selectedCoin: string
	recipients: AirdropRecipient[]
	csvInput: string
}

export function useAirdrop({ address, selectedCoin, recipients, csvInput }: UseAirdropParams) {
	const { executeTransaction } = useTransaction()
	const [isRecoveringGas, setIsRecoveringGas] = useState(false)
	const [isAirdropComplete, setIsAirdropComplete] = useState(false)
	const [lastCsvInput, setLastCsvInput] = useState<string>("")
	const [delegatorAddress, setDelegatorAddress] = useState<string>("")
	const [airdropProgress, setAirdropProgress] = useState<string>("")
	const [isProcessing, setIsProcessing] = useState(false)

	useEffect(() => {
		if (csvInput !== lastCsvInput) {
			setIsAirdropComplete(false)
		}
	}, [csvInput, lastCsvInput])

	const getDelegatorKeypair = (): Ed25519Keypair => {
		const storedKey = localStorage.getItem(DELEGATOR_KEY_STORAGE)
		if (storedKey) {
			return Ed25519Keypair.fromSecretKey(storedKey)
		}

		const newKeypair = Ed25519Keypair.generate()
		localStorage.setItem(DELEGATOR_KEY_STORAGE, newKeypair.getSecretKey())
		return newKeypair
	}

	const calculateTotalAmount = (decimals: number): bigint => {
		const total = recipients.reduce((sum, r) => sum + parseFloat(r.amount || "0"), 0)
		return BigInt(Math.ceil(total * Math.pow(10, decimals)))
	}

	const isSuiCoin = (coinType: string): boolean => {
		return coinType === SUI_TYPE_ARG
	}

	const handleAirdrop = async () => {
		if (!address) return

		if (!selectedCoin) {
			toast.error("Please select a coin")
			return
		}

		if (recipients.length === 0) {
			toast.error("Please add recipients")
			return
		}

		setIsProcessing(true)
		setAirdropProgress("Preparing transaction...")

		try {
			const coinMetadata = await suiClient.getCoinMetadata({
				coinType: selectedCoin,
			}) as CoinMetadata

			const totalAmountToSend = calculateTotalAmount(coinMetadata.decimals)
			const delegatorKeypair = getDelegatorKeypair()
			const delegatorAddr = delegatorKeypair.getPublicKey().toSuiAddress()

			setDelegatorAddress(delegatorAddr)
			setAirdropProgress("Sending transactions...")

			if (!isRecoveringGas) {
				await fundDelegator(
					address,
					delegatorAddr,
					selectedCoin,
					totalAmountToSend,
					recipients.length
				)

				await executeBatchAirdrop(
					delegatorKeypair,
					delegatorAddr,
					selectedCoin,
					coinMetadata.decimals,
					totalAmountToSend
				)
			}

			await recoverGas(delegatorKeypair, delegatorAddr, address)

			setIsAirdropComplete(true)
			setLastCsvInput(csvInput)
			setAirdropProgress("")
			setIsProcessing(false)

			toast.success("Airdrop finished", { duration: 3000 })
		} catch (error) {
			console.error("Error in airdrop:", error)
			toast.error("Failed to airdrop")
			setAirdropProgress("")
			setIsProcessing(false)
		}
	}

	const fundDelegator = async (
		sender: string,
		delegatorAddr: string,
		coinType: string,
		amount: bigint,
		recipientCount: number
	) => {
		const tx = new Transaction()
		tx.setSender(sender)

		const coinInput = isSuiCoin(coinType)
			? tx.splitCoins(tx.gas, [tx.pure.u64(amount)])
			: coinWithBalance({
					balance: amount,
					type: coinType,
					useGasCoin: true,
			  })(tx)

		const gasAmount = BigInt(recipientCount * GAS_PER_RECIPIENT * 10 ** SUI_DECIMALS)
		const gasInput = tx.splitCoins(tx.gas, [tx.pure.u64(gasAmount)])

		tx.transferObjects([coinInput, gasInput], delegatorAddr)

		if (process.env.NEXT_PUBLIC_FEE_ADDRESS) {
			const feeAmount = BigInt(recipientCount * SERVICE_FEE_PER_RECIPIENT * 10 ** SUI_DECIMALS)
			const feeInput = coinWithBalance({
				balance: feeAmount,
				type: SUI_TYPE_ARG,
			})(tx)
			tx.transferObjects([feeInput], process.env.NEXT_PUBLIC_FEE_ADDRESS)
		}

		const txResult = await executeTransaction(tx)
		await suiClient.waitForTransaction({ digest: txResult.digest })
	}

	const executeBatchAirdrop = async (
		delegatorKeypair: Ed25519Keypair,
		delegatorAddr: string,
		coinType: string,
		decimals: number,
		totalAmount: bigint
	) => {
		const totalBatches = Math.ceil(recipients.length / BATCH_SIZE)

		for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
			const tx = new Transaction()
			tx.setSender(delegatorAddr)

			const batchStart = batchIndex * BATCH_SIZE
			const batchEnd = Math.min(batchStart + BATCH_SIZE, recipients.length)
			const batchRecipients = recipients.slice(batchStart, batchEnd)

			const transferBalances = batchRecipients.map((r) =>
				String(BigInt(Math.ceil(parseFloat(r.amount) * Math.pow(10, decimals))))
			)
			const transferAddresses = batchRecipients.map((r) => r.address)

			const coinInput = isSuiCoin(coinType)
				? tx.gas
				: coinWithBalance({
						balance: totalAmount,
						type: coinType,
						useGasCoin: true,
				  })(tx)

			const splitCoins = tx.splitCoins(
				coinInput,
				transferBalances.map((balance) => tx.pure.u64(balance))
			)

			transferAddresses.forEach((addr, index) => {
				tx.transferObjects([splitCoins[index]], tx.pure.address(addr))
			})

			if (!isSuiCoin(coinType)) {
				tx.transferObjects([coinInput], address!)
			}

			const txResult = await delegatorKeypair.signAndExecuteTransaction({
				transaction: tx,
				client: suiClient,
			})

			setAirdropProgress(
				`Sending batch ${batchIndex + 1} of ${totalBatches} (${batchEnd}/${recipients.length} recipients)`
			)

			await suiClient.waitForTransaction({ digest: txResult.digest })
		}
	}

	const recoverGas = async (
		delegatorKeypair: Ed25519Keypair,
		delegatorAddr: string,
		recipient: string
	) => {
		setIsRecoveringGas(true)
		setAirdropProgress("Returning unused gas...")

		const tx = new Transaction()
		tx.setSender(delegatorAddr)
		tx.transferObjects([tx.gas], recipient)

		const txBytes = await tx.build({ client: suiClient })
		const { signature } = await delegatorKeypair.signTransaction(txBytes)

		const txResult = await suiClient.executeTransactionBlock({
			transactionBlock: txBytes,
			signature: [signature],
			options: {
				showEffects: true,
				showEvents: true,
			},
		})

		await suiClient.waitForTransaction({ digest: txResult.digest })
		setIsRecoveringGas(false)
	}

	return {
		handleAirdrop,
		isRecoveringGas,
		isAirdropComplete,
		lastCsvInput,
		delegatorAddress,
		airdropProgress,
		isProcessing,
	}
}
