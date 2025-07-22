"use client";

import { useCreatorData } from "@/hooks/use-creator-data";
import { formatAddress } from "@mysten/sui/utils";
import {
	Loader2,
	Rocket,
	Users,
	UserCheck
} from "lucide-react";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";

interface CreatorHoverCardProps {
	twitterHandle?: string;
	walletAddress?: string;
	children: React.ReactNode;
	className?: string;
}

export function CreatorHoverCard({
	twitterHandle,
	walletAddress,
	children
}: CreatorHoverCardProps) {
	const identifier = twitterHandle || walletAddress;
	const { data, isLoading } = useCreatorData(identifier);

	return (
		<HoverCard>
			<HoverCardTrigger asChild>
				{children}
			</HoverCardTrigger>
			<HoverCardContent className="w-80 p-0 bg-background/95 backdrop-blur-md border-2" sideOffset={5}>
				<div className="p-4">
					{/* Header */}
					<div className="flex items-center justify-between mb-4 pb-3 border-b border-foreground/10">
						<div>
							<p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
								CREATOR::IDENTITY
							</p>
							<p className="font-mono text-sm uppercase tracking-wider text-foreground/80 mt-1">
								{twitterHandle ? `@${twitterHandle}` : formatAddress(walletAddress || "")}
							</p>
						</div>
						{isLoading && (
							<Loader2 className="h-4 w-4 animate-spin text-muted-foreground/60" />
						)}
					</div>

					{/* Stats Grid */}
					{data ? (
						<div className="flex gap-2">
							{/* Tokens Launched */}
							<div className="relative group flex-1">
								<div className="absolute inset-0 bg-primary/10 blur-md rounded opacity-0 group-hover:opacity-100 transition-opacity" />
								<div className="relative p-3 border border-foreground/20 bg-background/50 backdrop-blur-sm rounded transition-all group-hover:border-foreground/40">
									<Rocket className="h-4 w-4 text-primary/80 mb-1.5" />
									<p className="font-mono text-lg font-bold text-foreground/80">
										{data.launchCount}
									</p>
									<p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
										TOKENS
									</p>
								</div>
							</div>

							{/* Trusted Followers */}
							<div className="relative group flex-1">
								<div className="absolute inset-0 bg-green-500/10 blur-md rounded opacity-0 group-hover:opacity-100 transition-opacity" />
								<div className="relative p-3 border border-foreground/20 bg-background/50 backdrop-blur-sm rounded transition-all group-hover:border-foreground/40">
									<UserCheck className="h-4 w-4 text-green-500/80 mb-1.5" />
									<p className="font-mono text-lg font-bold text-foreground/80">
										{data.trustedFollowers}
									</p>
									<p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
										TRUSTED
									</p>
								</div>
							</div>

							{/* Total Followers */}
							<div className="relative group flex-1">
								<div className="absolute inset-0 bg-blue-500/10 blur-md rounded opacity-0 group-hover:opacity-100 transition-opacity" />
								<div className="relative p-3 border border-foreground/20 bg-background/50 backdrop-blur-sm rounded transition-all group-hover:border-foreground/40">
									<Users className="h-4 w-4 text-blue-500/80 mb-1.5" />
									<p className="font-mono text-lg font-bold text-foreground/80">
										{data.followers}
									</p>
									<p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
										FOLLOWERS
									</p>
								</div>
							</div>
						</div>
					) : !isLoading ? (
						<div className="text-center py-6">
							<p className="font-mono text-xs uppercase text-muted-foreground">
								DATA::UNAVAILABLE
							</p>
						</div>
					) : null}
				</div>
			</HoverCardContent>
		</HoverCard>
	);
}