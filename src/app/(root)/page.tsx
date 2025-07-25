"use client"

import { useEffect } from "react"
import { TokenColumns } from "@/components/tokens/token-columns"
import { Skeleton } from "@/components/ui/skeleton"
import { usePoolsWithMetadata } from "@/hooks/pump/use-pools-with-metadata"
import { Logo } from "@/components/ui/logo"

export default function DiscoveryPage() {
	const {
		data: pools = [],
		isLoading,
		error,
		refetch,
		isFetching,
	} = usePoolsWithMetadata({
		page: 1,
		pageSize: 100,
	})

	// poll for new pools every 5 seconds
	useEffect(() => {
		const interval = setInterval(() => {
			refetch()
		}, 5000)

		return () => clearInterval(interval)
	}, [refetch])

	if (error) {
		return (
			<div className="h-[calc(100vh-theme(spacing.16)-theme(spacing.12)-theme(spacing.14))] md:h-[calc(100vh-theme(spacing.16)-theme(spacing.12))] flex items-center justify-center">
				<div className="text-center">
					<Logo className="w-12 h-12 mx-auto text-destructive mb-4" />
					<p className="font-mono text-sm uppercase text-destructive">ERROR::LOADING::DATA</p>
					<p className="font-mono text-xs uppercase text-destructive/60 mt-2">{error.message}</p>
				</div>
			</div>
		)
	}

	if (isLoading && pools.length === 0) {
		return (
			<div className="h-[calc(100vh-theme(spacing.16)-theme(spacing.12)-theme(spacing.14))] md:h-[calc(100vh-theme(spacing.16)-theme(spacing.12))] -mx-6 -my-6 p-4">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
					{[1, 2, 3].map((col) => (
						<div key={col} className="flex flex-col h-full">
							<div className="border-2 bg-background/50 backdrop-blur-sm rounded-lg p-2 mb-2">
								<Skeleton className="h-4 w-32 mb-1" />
								<Skeleton className="h-3 w-24" />
							</div>
							<div className="flex-1 border-2 bg-background/50 backdrop-blur-sm rounded-lg p-2">
								<div className="space-y-2">
									{[1, 2, 3, 4, 5].map((i) => (
										<Skeleton key={i} className="h-16 w-full" />
									))}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		)
	}

	return (
		<div className="h-[calc(100vh-theme(spacing.16)-theme(spacing.12)-theme(spacing.14))] md:h-[calc(100vh-theme(spacing.16)-theme(spacing.12))] -mx-6 -my-6 p-4">
			<TokenColumns pools={pools} isRefreshing={isFetching} />
		</div>
	)
}
