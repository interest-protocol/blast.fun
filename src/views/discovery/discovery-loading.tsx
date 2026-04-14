import { FC } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const DiscoveryLoading: FC = () => (
	<div className="h-full min-h-[50vh]">
		<div className="block lg:hidden space-y-3 p-4">
			<div className="flex gap-2">
				<Skeleton className="h-8 w-16" />
				<Skeleton className="h-8 w-20" />
				<Skeleton className="h-8 w-16" />
			</div>
			{Array.from({ length: 5 }).map((_, i) => (
				<Skeleton key={i} className="h-24 w-full rounded-lg" />
			))}
		</div>
		<div className="hidden lg:grid h-full grid-cols-1 lg:grid-cols-3 gap-4">
			{Array.from({ length: 3 }).map((col) => (
				<div key={col} className="flex flex-col gap-2 rounded-xl border border-border/50 bg-card/20 p-3">
					<Skeleton className="h-6 w-40" />
					{Array.from({ length: 6 }).map((_, i) => (
						<Skeleton key={i} className="h-20 w-full rounded-lg" />
					))}
				</div>
			))}
		</div>
	</div>
);

export default DiscoveryLoading;
