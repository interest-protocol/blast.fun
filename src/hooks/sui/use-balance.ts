import { useSuiClientQuery } from "@mysten/dapp-kit"
import { useEffect } from "react"
import { formatAmount } from "@/utils/format"
import { useUnifiedWallet } from "@/hooks/use-unified-wallet"

const DEFAULT_REFETCH_INTERVAL = 3000

export interface IUseBalanceParams {
	autoRefetch?: boolean
	autoRefetchInterval?: number
	// @dev: Allow overriding the address for specific use cases
	address?: string
}

export interface IUseBalanceResponse {
	balance: string | undefined
	error: Error | null
	refetch: () => void
}

const useBalance = ({ autoRefetch, autoRefetchInterval, address: overrideAddress }: IUseBalanceParams = {}): IUseBalanceResponse => {
	// @dev: Use unified wallet to get the active wallet address
	const { address: unifiedAddress } = useUnifiedWallet()
	const address = overrideAddress || unifiedAddress
	
	const { data, refetch, error } = useSuiClientQuery("getBalance", {
		owner: address as string,
	}, {
		enabled: !!address
	})

	useEffect(() => {
		if (autoRefetch == null || autoRefetch === false) {
			return
		}

		const interval = setInterval(
			() => {
				if (address == null || !autoRefetch) {
					clearInterval(interval)
					return
				}

				refetch()
			},
			autoRefetch && autoRefetchInterval != null ? autoRefetchInterval : DEFAULT_REFETCH_INTERVAL
		)

		return () => {
			clearTimeout(interval)
		}
	}, [refetch, autoRefetch, autoRefetchInterval, address])

	return {
		balance: data ? formatAmount(data.totalBalance) : undefined,
		error,
		refetch: async () => {
			refetch()
		},
	}
}

export default useBalance
