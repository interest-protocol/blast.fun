"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function TokenCardSkeleton() {
	return (
		<div className="group relative border-border/40 border-b">
			<div className="relative p-3 sm:p-2">
				<div className="flex gap-3 sm:gap-2.5">
					{/* Avatar skeleton */}
					<div className="flex-shrink-0">
						<Skeleton className="h-[48px] w-[48px] rounded-md sm:h-[56px] sm:w-[56px]" />
					</div>

					{/* Content skeleton */}
					<div className="min-w-0 flex-1 space-y-2">
						{/* Title and symbol */}
						<div className="flex items-center gap-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="ml-auto h-3 w-12" />
						</div>

						{/* Stats */}
						<div className="flex items-center gap-2 sm:gap-3">
							<Skeleton className="h-3 w-16" />
							<Skeleton className="h-3 w-16" />
							<Skeleton className="h-3 w-12" />
							<Skeleton className="h-3 w-12" />
						</div>

						{/* Creator and date */}
						<div className="flex items-center gap-1.5">
							<Skeleton className="h-3 w-10" />
							<Skeleton className="h-3 w-20" />
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
