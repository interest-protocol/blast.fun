import { FC } from "react";

import { Skeleton } from "@/components/ui/skeleton";

const TokenCardSkeleton: FC = () => {
	return (
		<div className="relative border-b border-border/40 group">
			<div className="relative p-3 sm:p-2">
				<div className="flex gap-3 sm:gap-2.5">
					{/* Avatar skeleton */}
					<div className="flex-shrink-0">
						<Skeleton className="h-[48px] w-[48px] sm:h-[56px] sm:w-[56px] rounded-md" />
					</div>

					{/* Content skeleton */}
					<div className="flex-1 min-w-0 space-y-2">
						{/* Title and symbol */}
						<div className="flex items-center gap-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-3 w-12 ml-auto" />
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
	);
}

export default TokenCardSkeleton;