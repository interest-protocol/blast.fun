import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { PROJECT_WALLETS } from "@/constants/project-wallets"

interface CoinHolder {
	account: string
	balance: string
	percentage: string
	name: string
	image: string
	website: string
}

interface HoldersResponse {
	holders: CoinHolder[]
	timestamp: number
}

// @dev: Hook to get holders data and check for projects
export function useHoldersData(coinType: string) {
	const { data, isLoading, error } = useQuery<HoldersResponse>({
		queryKey: ["holders", coinType],
		queryFn: async () => {
			const response = await fetch(`/api/coin/holders/${encodeURIComponent(coinType)}`)
			if (!response.ok) {
				throw new Error("Failed to fetch holders")
			}
			return response.json()
		},
		enabled: !!coinType,
		refetchInterval: 15000,
		staleTime: 10000,
	})

	const projectHolders = useMemo(() => {
		if (!data?.holders) return []
		return data.holders.filter((holder) => PROJECT_WALLETS[holder.account])
	}, [data?.holders])

	return { data, isLoading, error, hasProjects: projectHolders.length > 0 }
}
