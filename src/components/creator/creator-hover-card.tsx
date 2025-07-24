"use client";

import { useCreatorData } from "@/hooks/use-creator-data";
import { useResolveSuiNSName } from "@mysten/dapp-kit";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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

	const { data: resolvedDomain } = useResolveSuiNSName(!twitterHandle && walletAddress ? walletAddress : null);

	const displayName = twitterHandle
		? `@${twitterHandle}`
		: resolvedDomain
			? `@${resolvedDomain.replace(/\.sui$/i, "")}`
			: formatAddress(walletAddress || "");

	return (
		<HoverCard>
			<HoverCardTrigger asChild>
				{children}
			</HoverCardTrigger>
			<HoverCardContent className="w-80 p-0 bg-background/50 backdrop-blur-sm border-2 border-border/40 shadow-2xl select-none" sideOffset={5}>
				<div className="p-4">
					{/* Header */}
					<div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-dashed border-border/20">
						<div>
							<p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
								CREATOR::IDENTITY
							</p>
							<p className="font-mono text-sm uppercase tracking-wider text-foreground/80 mt-1">
								{displayName}
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
								<div className="absolute inset-0 bg-primary/20 blur-xl rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
								<div className="relative p-2.5 border-2 border-dashed border-border/20 bg-background/50 backdrop-blur-sm rounded transition-all duration-300 group-hover:border-primary/40">
									<Rocket className="h-4 w-4 text-primary/80 mb-1" />
									<p className="font-mono text-sm font-bold text-foreground/80 whitespace-nowrap">
										{data.launchCount}
									</p>
									<p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
										TOKENS
									</p>
								</div>
							</div>

							{/* Trusted Followers */}
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="relative group flex-1 cursor-help">
										{(() => {
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

											const trustedCount = parseFormattedNumber(data.trustedFollowers);

											const getColorRgb = (count: number): string => {
												if (count >= 10000) return "6, 182, 212"; // cyan-500
												if (count >= 5000) return "234, 179, 8"; // yellow-500
												if (count >= 1000) return "168, 85, 247"; // purple-500
												if (count >= 500) return "59, 130, 246"; // blue-500
												if (count >= 100) return "34, 197, 94"; // green-500
												return "100, 116, 139"; // slate-500
											};

											const colorRgb = getColorRgb(trustedCount);

											return (
												<>
													<div
														className="absolute inset-0 blur-xl rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300"
														style={{ backgroundColor: `rgba(${colorRgb}, 0.2)` }}
													/>
													<div
														className="relative p-2.5 border-2 border-dashed border-border/20 bg-background/50 backdrop-blur-sm rounded transition-all duration-300 hover:border-opacity-0"
														style={{
															"--tw-border-opacity": 1,
														} as React.CSSProperties}
														onMouseEnter={(e) => {
															e.currentTarget.style.borderColor = `rgba(${colorRgb}, 0.4)`;
														}}
														onMouseLeave={(e) => {
															e.currentTarget.style.borderColor = '';
														}}
													>
														<UserCheck
															className="h-4 w-4 mb-1"
															style={{ color: `rgba(${colorRgb}, 0.8)` }}
														/>
														<p className="font-mono text-sm font-bold text-foreground/80 whitespace-nowrap">
															{data.trustedFollowers}
														</p>
														<p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
															TRUSTED
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
							<div className="relative group flex-1">
								<div className="absolute inset-0 bg-blue-500/20 blur-xl rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
								<div className="relative p-2.5 border-2 border-dashed border-border/20 bg-background/50 backdrop-blur-sm rounded transition-all duration-300 group-hover:border-blue-500/40">
									<Users className="h-4 w-4 text-blue-500/80 mb-1" />
									<p className="font-mono text-sm font-bold text-foreground/80 whitespace-nowrap">
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