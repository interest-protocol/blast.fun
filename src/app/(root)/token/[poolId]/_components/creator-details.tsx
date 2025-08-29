"use client";

import { useResolveSuiNSName } from "@mysten/dapp-kit";
import { formatAddress } from "@mysten/sui/utils";
import {
	Loader2,
	Rocket,
	Users,
	UserCheck,
	ExternalLink,
} from "lucide-react";
import { BsTwitterX } from "react-icons/bs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { PoolWithMetadata } from "@/types/pool";

interface CreatorDetailsProps {
	pool: PoolWithMetadata;
}

export function CreatorDetails({ pool }: CreatorDetailsProps) {
	const creatorTwitterHandle = pool.creatorData?.twitterHandle;
	const creatorTwitterId = pool.creatorData?.twitterId;
	const creatorWallet = pool.creatorAddress;
	const showTwitterCreator = !!creatorTwitterHandle;
	const data = pool.creatorData;

	const { data: resolvedDomain } = useResolveSuiNSName(!showTwitterCreator && creatorWallet ? creatorWallet : null);

	const displayName = showTwitterCreator
		? `@${creatorTwitterHandle}`
		: resolvedDomain
			? resolvedDomain
			: formatAddress(creatorWallet || "");

	const parseFormattedNumber = (str: string): number => {
		const cleanStr = str.replace(/,/g, '');
		const match = cleanStr.match(/^(\d+\.?\d*)([KMB])?$/i);
		if (!match) return 0;

		const num = parseFloat(match[1]);
		const suffix = match[2]?.toUpperCase();

		switch (suffix) {
			case 'K': return num * 1000;
			case 'M': return num * 1000000;
			case 'B': return num * 1000000000;
			default: return num;
		}
	};

	const getColorRgb = (count: number): string => {
		if (count >= 10000) return "6, 182, 212"; // cyan-500
		if (count >= 5000) return "234, 179, 8"; // yellow-500
		if (count >= 1000) return "168, 85, 247"; // purple-500
		if (count >= 500) return "59, 130, 246"; // blue-500
		if (count >= 100) return "34, 197, 94"; // green-500
		return "100, 116, 139"; // slate-500
	};

	return (
		<div className="border-b border-border">
			<div className="p-3">
				{/* Header */}
				<div className="flex items-center justify-between mb-3">
					<div className="flex flex-col gap-0.5">
						<p className="font-mono font-medium text-[10px] uppercase tracking-wider text-muted-foreground">
							Created by
						</p>
						<div className="flex items-center gap-1.5">
							<span className="font-mono text-sm font-bold text-foreground">
								{displayName}
							</span>
							{showTwitterCreator && (
								<a
									href={creatorTwitterId ? `https://x.com/i/user/${creatorTwitterId}` : `https://x.com/${creatorTwitterHandle}`}
									target="_blank"
									rel="noopener noreferrer"
									className="text-muted-foreground hover:text-foreground transition-colors"
								>
									<BsTwitterX className="h-3.5 w-3.5" />
								</a>
							)}
							{creatorWallet && (
								<a
									href={`https://suiscan.xyz/mainnet/account/${creatorWallet}`}
									target="_blank"
									rel="noopener noreferrer"
									className="text-muted-foreground hover:text-foreground transition-colors"
								>
									<ExternalLink className="h-3.5 w-3.5" />
								</a>
							)}
						</div>
					</div>
				</div>

				{/* Stats Grid */}
				{data ? (
					<div className="flex gap-2">
						{/* Tokens Launched */}
						<div className="relative flex-1 group">
							<div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 blur-sm rounded-lg opacity-75 group-hover:opacity-100 transition-opacity" />
							<div className="relative p-2.5 border border-primary/20 bg-background/80 backdrop-blur-sm rounded-lg hover:border-primary/40 transition-colors">
								<div className="flex items-center justify-between mb-1">
									<Rocket className="h-3.5 w-3.5 text-primary" />
									<p className="font-mono text-sm font-bold text-foreground">
										{data.launchCount}
									</p>
								</div>
								<p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
									Tokens
								</p>
							</div>
						</div>

						{/* Trusted Followers */}
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="relative flex-1 cursor-help group">
									{(() => {
										const trustedCount = parseFormattedNumber(data.trustedFollowers);
										const colorRgb = getColorRgb(trustedCount);

										return (
											<>
												<div
													className="absolute inset-0 blur-sm rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"
													style={{ background: `linear-gradient(to bottom right, rgba(${colorRgb}, 0.15), rgba(${colorRgb}, 0.05))` }}
												/>
												<div
													className="relative p-2.5 border bg-background/80 backdrop-blur-sm rounded-lg hover:border-opacity-60 transition-all"
													style={{ borderColor: `rgba(${colorRgb}, 0.3)` }}
												>
													<div className="flex items-center justify-between mb-1">
														<UserCheck
															className="h-3.5 w-3.5"
															style={{ color: `rgb(${colorRgb})` }}
														/>
														<p className="font-mono text-sm font-bold text-foreground">
															{data.trustedFollowers}
														</p>
													</div>
													<p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
														Trusted
													</p>
												</div>
											</>
										);
									})()}
								</div>
							</TooltipTrigger>
							<TooltipContent className="max-w-[250px]">
								<p className="text-xs">
									Followers actively engaged in crypto and verified by the community
								</p>
							</TooltipContent>
						</Tooltip>

						{/* Total Followers */}
						<div className="relative flex-1 group">
							<div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-500/5 blur-sm rounded-lg opacity-75 group-hover:opacity-100 transition-opacity" />
							<div className="relative p-2.5 border border-blue-500/20 bg-background/80 backdrop-blur-sm rounded-lg hover:border-blue-500/40 transition-colors">
								<div className="flex items-center justify-between mb-1">
									<Users className="h-3.5 w-3.5 text-blue-500" />
									<p className="font-mono text-sm font-bold text-foreground">
										{data.followers}
									</p>
								</div>
								<p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
									Followers
								</p>
							</div>
						</div>
					</div>
				) : (
					<div className="text-center py-3">
						<p className="font-mono text-xs uppercase text-muted-foreground">
							DATA UNAVAILABLE
						</p>
					</div>
				)}
			</div>
		</div>
	);
}