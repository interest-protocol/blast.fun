"use client"

import { useState, useEffect, useCallback } from "react"
import { useApp } from "@/context/app.context"
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit"
import toast from "react-hot-toast"
import { migratorSdk } from "@/lib/pump"
import { useTransaction } from "./sui/use-transaction"

interface Position {
	id: string
	memeCoinType: string
	blueFinPoolId: string
	blueFinPositionId: string
}

export function useMigrationPositions() {
	const { wallet, address } = useApp()
	const { executeTransaction } = useTransaction()

	const [positions, setPositions] = useState<Position[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const fetchPositions = useCallback(async () => {
		if (!address) return

		setIsLoading(true)
		setError(null)

		try {
			const res = await migratorSdk.getPositions({ owner: address })
			if (!res || !res.positions || res.positions.length === 0) {
				setPositions([])
				return
			}

			const positions: Position[] = res.positions.map(p => ({
				id: p.objectId,
				memeCoinType: p.memeCoinType,
				blueFinPoolId: p.blueFinPoolId,
				blueFinPositionId: p.blueFinPositionId,
			}))

			setPositions(positions)
		} catch (err) {
			console.error("Error fetching positions:", err)
			setError("Failed to fetch positions")
		} finally {
			setIsLoading(false)
		}
	}, [address])

	const collectFees = useCallback(async (positionId: string) => {
		if (!wallet || !address) {
			toast.error("Please connect your wallet")
			return
		}

		const position = positions.find(p => p.id === positionId)
		if (!position) {
			toast.error("Position not found")
			return
		}

		try {
			const { tx, suiCoin } = migratorSdk.collectFee({
				bluefinPool: position.blueFinPoolId,
				memeCoinType: position.memeCoinType,
				positionOwner: position.id,
			})

			tx.transferObjects([suiCoin], tx.pure.address(address))

			await executeTransaction(tx)
		} catch (err) {
			console.error("Error creating transaction:", err)
			toast.error("Failed to create transaction")
		}
	}, [wallet, address, positions, fetchPositions])

	useEffect(() => {
		if (address) {
			fetchPositions()
		} else {
			setPositions([])
		}
	}, [address, fetchPositions])

	return {
		positions,
		isLoading,
		error,
		collectFees,
		refetch: fetchPositions,
	}
}