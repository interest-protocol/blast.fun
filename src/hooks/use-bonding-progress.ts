import { useQuery } from "@tanstack/react-query"
import { getBondingProgress, type BondingProgressData } from "@/lib/get-bonding-progress"

export function useBondingProgress(coinType: string | undefined) {
	const { data, isLoading, error } = useQuery<BondingProgressData>({
		queryKey: ["bonding-progress", coinType],
		queryFn: () => getBondingProgress(coinType!),
		enabled: !!coinType,
		refetchInterval: 3000, // Refetch every 3 seconds
		refetchIntervalInBackground: true,
		staleTime: 2000, // Consider data stale after 2 seconds
	})

	return { data: data ?? null, isLoading, error }
}