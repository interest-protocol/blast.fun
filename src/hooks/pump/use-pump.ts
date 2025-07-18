import { useState } from 'react'
import { Transaction } from '@mysten/sui/transactions'
import { coinWithBalance } from '@mysten/sui/transactions'
import { MIST_PER_SUI } from '@mysten/sui/utils'
import { pumpSdk } from '@/lib/pump'
import { useTransaction } from '@/hooks/sui/use-transaction'
import { useApp } from '@/context/app.context'
import type { PoolWithMetadata } from '@/types/pool'

interface UsePumpOptions {
    pool: PoolWithMetadata
    decimals?: number
}

interface UsePumpReturn {
    isLoading: boolean
    error: string | null
    pump: (amountInSui: string) => Promise<void>
    dump: (amountInTokens: string) => Promise<void>
}

export function usePump({ pool, decimals = 9 }: UsePumpOptions): UsePumpReturn {
    const { address, isConnected } = useApp()
    const { executeTransaction } = useTransaction()

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const pump = async (amountInSui: string) => {
        if (!isConnected || !address) {
            setError('WALLET::NOT_CONNECTED')
            return
        }

        const amount = parseFloat(amountInSui)
        if (!amount || amount <= 0) {
            setError('AMOUNT::INVALID')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const tx = new Transaction()
            const amountInMist = Math.floor(amount * Number(MIST_PER_SUI))

            const quoteCoin = tx.splitCoins(tx.gas, [tx.pure.u64(amountInMist)])

            const { memeCoin, tx: pumpTx } = await pumpSdk.pump({
                tx,
                pool: pool.poolId,
                quoteCoin
            })

            pumpTx.transferObjects([memeCoin], address)

            await executeTransaction(pumpTx)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'UNKNOWN_ERROR'
            setError(errorMessage)
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const dump = async (amountInTokens: string) => {
        if (!isConnected || !address) {
            setError('WALLET::NOT_CONNECTED')
            return
        }

        const amount = parseFloat(amountInTokens)
        if (!amount || amount <= 0) {
            setError('AMOUNT::INVALID')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const tx = new Transaction()
            const amountInSmallestUnit = Math.floor(amount * Math.pow(10, decimals))

            const memeCoin = coinWithBalance({
                balance: BigInt(amountInSmallestUnit),
                type: pool.coinType
            })(tx)

            const { quoteCoin, tx: dumpTx } = await pumpSdk.dump({
                tx,
                pool: pool.poolId,
                memeCoin
            })

            dumpTx.transferObjects([quoteCoin], address)

            await executeTransaction(dumpTx)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'UNKNOWN_ERROR'
            setError(errorMessage)
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    return {
        isLoading,
        error,
        pump,
        dump
    }
}