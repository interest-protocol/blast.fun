import { useQuery } from "@tanstack/react-query";
import type { CreatorData } from "@/types/pool";

export function useCreatorData(identifier: string | undefined) {
	return useQuery<CreatorData>({
		queryKey: ["creator", identifier],
		queryFn: async () => {
			if (!identifier) throw new Error("No identifier provided");

			const response = await fetch(`/api/creators/${identifier}`);
			if (!response.ok) {
				throw new Error("Failed to fetch creator data");
			}

			return response.json();
		},
		enabled: !!identifier,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}