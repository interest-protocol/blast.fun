"use client";

import { useMemo, useState } from "react";
import { Token } from "@/types/token";
import { Users, ExternalLink, Building2, User, Lock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { formatAddress } from "@mysten/sui/utils";
import { cn } from "@/utils";
import { Logo } from "@/components/ui/logo";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSuiNSNames } from "@/hooks/use-suins";
import { formatNumberWithSuffix } from "@/utils/format";
import { PROJECT_WALLETS } from "@/constants/project-wallets";
import { useTwitterRelations } from "../../_context/twitter-relations.context";
import { VestingApi } from "@/lib/getVesting";
import BigNumber from "bignumber.js";

interface HoldersTabProps {
    pool: Token;
    className?: string;
    activeTab?: "holders" | "projects";
    onTabChange?: (tab: "holders" | "projects") => void;
}

interface HoldersWithTabsProps {
    pool: Token;
    className?: string;
}

interface CoinHolder {
    account: string;
    balance: string;
    percentage: string;
    name: string;
    image: string;
    website: string;
    burnBreakdown?: {
        zeroAddress: number;
        zeroAddressPercent: number;
        trueBurn: number;
        trueBurnPercent: number;
    };
    isVesting?: boolean; // @dev: This row represents vesting balance
    vestingPositions?: number; // @dev: Number of vesting positions (for tooltip)
}

interface HoldersResponse {
    holders: CoinHolder[];
    timestamp: number;
}

// @dev: Wrapper component that manages state
export function HoldersWithTabs({ pool, className }: HoldersWithTabsProps) {
    const [activeTab, setActiveTab] = useState<"holders" | "projects">(
        "holders"
    );

    return (
        <HoldersTab
            pool={pool}
            className={className}
            activeTab={activeTab}
            onTabChange={setActiveTab}
        />
    );
}

export function HoldersTab({
    pool,
    className,
    activeTab = "holders",
    onTabChange,
}: HoldersTabProps) {
    const { data, isLoading, error } = useQuery<HoldersResponse>({
        queryKey: ["holders", pool.coinType],
        queryFn: async () => {
            const response = await fetch(
                `/api/coin/holders/${encodeURIComponent(pool.coinType)}`,
                {
                    headers: {
                        "cloudflare-cache": "15",
                        "cache-control": "no-store",
                    },
                }
            );
            if (!response.ok) {
                throw new Error("Failed to fetch holders");
            }
            return response.json();
        },
        enabled: !!pool.coinType,
        refetchInterval: 15000, // @dev: Refetch every 15 seconds (matches edge cache)
        staleTime: 10000, // @dev: Consider data stale after 10 seconds
    });

    // @dev: Fetch vesting data
    const { data: vestingData } = useQuery({
        queryKey: ["all-vesting-positions", pool.coinType],
        queryFn: () => VestingApi.getAllVestingsByCoinType(pool.coinType),
        enabled: !!pool.coinType,
        staleTime: 30000, // 30 seconds
    });

    const { addressToTwitter } = useTwitterRelations();

    // @dev: Filter project holders from the main holders list
    const projectHolders = useMemo(() => {
        if (!data?.holders) return [];
        return data.holders.filter((holder) => PROJECT_WALLETS[holder.account]);
    }, [data?.holders]);

    // @dev: Get display holders based on active tab and aggregate burns + vesting
    const displayHolders = useMemo(() => {
        if (activeTab === "projects") return projectHolders;

        const holders = data?.holders || [];
        const allHolders: CoinHolder[] = [];

        // @dev: Aggregate vesting positions by owner
        const vestingByOwner = new Map<
            string,
            { balance: BigNumber; count: number }
        >();
        if (vestingData?.data) {
            vestingData.data.forEach((position) => {
                const current = vestingByOwner.get(position.owner) || {
                    balance: new BigNumber(0),
                    count: 0,
                };
                // @dev: balance and released are already in human-readable format from API
                const totalVested = new BigNumber(position.balance).plus(
                    position.released
                );
                current.balance = current.balance.plus(totalVested);
                current.count++;
                vestingByOwner.set(position.owner, current);
            });
        }

        console.log({ holders });

        // Find burn addresses
        const burnAddress = holders.find(
            (h) =>
                h.account ===
                "0x0000000000000000000000000000000000000000000000000000000000000000"
        );
				
        const trueBurn = holders.find((h) => h.account === "true_burn");

        // Filter out individual burn addresses
        const filteredHolders = holders.filter(
            (h) =>
                h.account !==
                    "0x0000000000000000000000000000000000000000000000000000000000000000" &&
                h.account !== "true_burn"
        );

        // @dev: Create holder entries - both regular and vesting as separate rows
        const processedAddresses = new Set<string>();

        // First add all regular holders
        filteredHolders.forEach((holder) => {
            allHolders.push({ ...holder });
            processedAddresses.add(holder.account);
        });

        // @dev: Add vesting entries as separate rows
        vestingByOwner.forEach((vestingInfo, owner) => {
            // Add vesting row
            allHolders.push({
                account: owner,
                balance: vestingInfo.balance.toString(),
                percentage: vestingInfo.balance
                    .dividedBy(1_000_000_000)
                    .toString(),
                name: "",
                image: "",
                website: "",
                isVesting: true,
                vestingPositions: vestingInfo.count,
            });

            // @dev: If this address doesn't have a regular holder entry, add one with 0 balance
            if (!processedAddresses.has(owner)) {
                allHolders.push({
                    account: owner,
                    balance: "0",
                    percentage: "0",
                    name: "",
                    image: "",
                    website: "",
                });
            }
        });

        // Create aggregated burn holder if either exists
        if (burnAddress || trueBurn) {
            const burnBalance = parseFloat(burnAddress?.balance || "0");
            const trueBurnBalance = parseFloat(trueBurn?.balance || "0");
            const totalBurnBalance = burnBalance + trueBurnBalance;

            const aggregatedBurn = {
                account: "aggregated_burn",
                balance: totalBurnBalance.toString(),
                percentage: (totalBurnBalance / 1_000_000_000).toString(),
                name: "",
                image: "",
                website: "",
                burnBreakdown: {
                    zeroAddress: burnBalance,
                    zeroAddressPercent: (burnBalance / 1_000_000_000) * 100,
                    trueBurn: trueBurnBalance,
                    trueBurnPercent: (trueBurnBalance / 1_000_000_000) * 100,
                },
            };

            allHolders.push(aggregatedBurn);
        }

        // @dev: Sort by balance descending, grouping vesting rows after their main holder
        return allHolders.sort((a, b) => {
            // If both are for the same account, regular comes before vesting
            if (a.account === b.account) {
                if (a.isVesting && !b.isVesting) return 1;
                if (!a.isVesting && b.isVesting) return -1;
            }

            // Otherwise sort by balance
            const aBalance = parseFloat(a.balance || "0");
            const bBalance = parseFloat(b.balance || "0");
            return bBalance - aBalance;
        });
    }, [activeTab, data?.holders, projectHolders, vestingData]);

    // @dev: Get all holder addresses for SuiNS resolution
    const holderAddresses = useMemo(() => {
        return displayHolders.map((h) => h.account) || [];
    }, [displayHolders]);

    // @dev: Fetch SuiNS names for all holders
    const { data: suinsNames } = useSuiNSNames(holderAddresses);

    if (isLoading) {
        return (
            <div className="w-full">
                {/* Header Skeleton */}
                <div className="grid grid-cols-12 py-2 border-b border-border/50">
                    <div className="col-span-1"></div>
                    <div className="col-span-5 pl-2">
                        <Skeleton className="h-3 w-16" />
                    </div>
                    <div className="col-span-3 flex justify-end">
                        <Skeleton className="h-3 w-16" />
                    </div>
                    <div className="col-span-3 flex justify-end pr-2">
                        <Skeleton className="h-3 w-16" />
                    </div>
                </div>

                {/* Holders List Skeleton */}
                {Array.from({ length: 10 }).map((_, i) => (
                    <div
                        key={i}
                        className="grid grid-cols-12 py-3 items-center border-b border-border/30"
                    >
                        {/* Rank */}
                        <div className="col-span-1 flex justify-center">
                            <Skeleton className="h-3 w-3" />
                        </div>

                        {/* Address */}
                        <div className="col-span-5 pl-2">
                            <Skeleton className="h-3 w-24" />
                        </div>

                        {/* Holdings */}
                        <div className="col-span-3 flex justify-end">
                            <Skeleton className="h-3 w-16" />
                        </div>

                        {/* Percentage */}
                        <div className="col-span-3 flex justify-end pr-2">
                            <Skeleton className="h-3 w-12" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <Logo className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
                <p className="font-mono text-sm uppercase text-destructive">
                    ERROR::LOADING::HOLDERS
                </p>
                <p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">
                    CHECK_CONNECTION
                </p>
            </div>
        );
    }

    if (!data?.holders || data.holders.length === 0) {
        return (
            <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-foreground/20 mb-4 animate-pulse" />
                <p className="font-mono text-sm uppercase text-muted-foreground">
                    NO::HOLDERS::FOUND
                </p>
                <p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">
                    LIQUIDITY_POOLS_NOT_DETECTED
                </p>
            </div>
        );
    }

    // @dev: Check if there are no project holders for the projects tab
    if (activeTab === "projects" && projectHolders.length === 0) {
        return (
            <div className="text-center py-12">
                <Building2 className="w-12 h-12 mx-auto text-foreground/20 mb-4 animate-pulse" />
                <p className="font-mono text-sm uppercase text-muted-foreground">
                    NO::PROJECTS::HOLDING
                </p>
                <p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">
                    NO_ECOSYSTEM_PROJECTS_FOUND
                </p>
            </div>
        );
    }

    return (
        <ScrollArea className={cn(className || "h-[500px]")}>
            <div className="w-full">
                <div className="relative">
                    {/* Header */}
                    <div className="grid grid-cols-12 py-2 border-b border-border/50 text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground sticky top-0 bg-background/95 backdrop-blur-sm z-10 select-none">
                        <div className="col-span-1 text-center"></div>
                        <div className="col-span-5 pl-2">ADDRESS</div>
                        <div className="col-span-3 text-right">HOLDINGS</div>
                        <div className="col-span-3 text-right pr-2">
                            SHARE %
                        </div>
                    </div>

                    {/* Holders List */}
                    {displayHolders.map((holder, index) => {
                        const rank = index + 1;
                        // @dev: Calculate percentage - if empty from API, calculate from balance / 1B total supply
                        let percentage: number;
                        if (!holder.percentage || holder.percentage === "") {
                            const balanceNum = parseFloat(
                                holder.balance.replace(/,/g, "")
                            );
                            percentage = (balanceNum / 1_000_000_000) * 100;
                        } else {
                            percentage = parseFloat(holder.percentage) * 100; // @dev: Convert decimal to percentage
                        }

                        const suinsName = suinsNames?.[holder.account];
                        // @dev: Check if this is a project wallet
                        const projectName = PROJECT_WALLETS[holder.account];
                        // @dev: Format balance with K/M suffix
                        const balanceNum = parseFloat(
                            holder.balance.replace(/,/g, "")
                        );
                        const formattedBalance =
                            formatNumberWithSuffix(balanceNum);
                        // @dev: Check if this holder is the developer
                        const isDev =
                            holder.account === pool.creator?.address &&
                            !holder.isVesting;
                        // @dev: Check if this is the aggregated burn address
                        const isAggregatedBurn =
                            holder.account === "aggregated_burn";

                        console.log({
                            isAggregatedBurn,
                            holder: holder.account,
                        });

                        const rowContent = (
                            <div
                                className={cn(
                                    "relative grid grid-cols-12 py-2 sm:py-3 items-center border-b border-border/30",
                                    isAggregatedBurn && "text-destructive"
                                )}
                            >
                                {/* Rank */}
                                <div className="col-span-1 text-center">
                                    <div
                                        className={cn(
                                            "font-mono text-[10px] sm:text-xs",
                                            isAggregatedBurn
                                                ? "text-destructive"
                                                : "text-muted-foreground"
                                        )}
                                    >
                                        {rank}
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="col-span-5 flex items-center gap-2 pl-2">
                                    {holder.image && !holder.isVesting && (
                                        <img
                                            src={holder.image}
                                            alt={holder.name || "Holder"}
                                            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            {isAggregatedBurn ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="px-1.5 py-0.5 bg-destructive/10 rounded font-mono text-[10px] uppercase text-destructive">
                                                        BURN
                                                    </span>
                                                </div>
                                            ) : holder.isVesting ? (
                                                // @dev: For vesting rows, make address and badge clickable
                                                <div className="flex items-center gap-2">
                                                    <a
                                                        href={`https://suivision.xyz/account/${holder.account}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="font-mono text-[10px] sm:text-xs text-muted-foreground hover:text-primary transition-colors"
                                                    >
                                                        {holder.account.slice(
                                                            0,
                                                            8
                                                        )}
                                                        ...
                                                    </a>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <a
                                                                    href={`https://suivision.xyz/account/${holder.account}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="px-1.5 py-0.5 bg-purple-500/10 rounded font-mono text-[9px] uppercase text-purple-500 flex items-center gap-0.5 cursor-pointer hover:bg-purple-500/20 transition-colors"
                                                                >
                                                                    <Lock className="h-2.5 w-2.5" />
                                                                    VESTING
                                                                </a>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <div className="text-xs">
                                                                    {
                                                                        holder.vestingPositions
                                                                    }{" "}
                                                                    vesting
                                                                    position
                                                                    {holder.vestingPositions &&
                                                                    holder.vestingPositions >
                                                                        1
                                                                        ? "s"
                                                                        : ""}
                                                                </div>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            ) : addressToTwitter.has(
                                                  holder.account
                                              ) ? (
                                                <a
                                                    href={`https://x.com/${addressToTwitter.get(
                                                        holder.account
                                                    )}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-mono text-[10px] sm:text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                                                >
                                                    <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                                                    <span className="text-primary truncate max-w-[80px] sm:max-w-[120px] md:max-w-[150px]">
                                                        @
                                                        {addressToTwitter.get(
                                                            holder.account
                                                        )}
                                                    </span>
                                                    {isDev && (
                                                        <span className="text-destructive font-bold flex-shrink-0">
                                                            (DEV)
                                                        </span>
                                                    )}
                                                </a>
                                            ) : projectName ? (
                                                <a
                                                    href={`https://suivision.xyz/account/${holder.account}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex flex-col hover:opacity-80 transition-opacity"
                                                >
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-mono text-[10px] sm:text-xs text-primary">
                                                            {projectName}
                                                        </span>
                                                        <ExternalLink className="h-2.5 w-2.5 opacity-50" />
                                                    </div>
                                                    <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground">
                                                        {formatAddress(
                                                            holder.account
                                                        )}
                                                    </span>
                                                </a>
                                            ) : holder.name ? (
                                                <a
                                                    href={`https://suivision.xyz/account/${holder.account}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex flex-col hover:opacity-80 transition-opacity"
                                                >
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-mono text-[10px] sm:text-xs text-primary">
                                                            {holder.name}
                                                        </span>
                                                        {holder.website && (
                                                            <ExternalLink className="h-2.5 w-2.5 opacity-50" />
                                                        )}
                                                    </div>
                                                    <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground">
                                                        {formatAddress(
                                                            holder.account
                                                        )}
                                                    </span>
                                                </a>
                                            ) : suinsName ? (
                                                <a
                                                    href={`https://suivision.xyz/account/${holder.account}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex flex-col hover:opacity-80 transition-opacity"
                                                >
                                                    <span className="font-mono text-[10px] sm:text-xs text-foreground">
                                                        {suinsName}
                                                    </span>
                                                    <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground">
                                                        {formatAddress(
                                                            holder.account
                                                        )}
                                                    </span>
                                                </a>
                                            ) : (
                                                <a
                                                    href={`https://suivision.xyz/account/${holder.account}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-mono text-[10px] sm:text-xs text-muted-foreground hover:text-primary transition-colors"
                                                >
                                                    <span className="sm:hidden">
                                                        {formatAddress(
                                                            holder.account
                                                        ).slice(0, 6) + "..."}
                                                    </span>
                                                    <span className="hidden sm:inline">
                                                        {formatAddress(
                                                            holder.account
                                                        )}
                                                    </span>
                                                </a>
                                            )}
                                            {/* Labels for special wallets */}
                                            {isDev && (
                                                <span className="px-1.5 py-0.5 bg-primary/10 rounded font-mono text-[9px] uppercase text-primary">
                                                    DEV
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Holdings */}
                                <div
                                    className={cn(
                                        "col-span-3 text-right font-mono text-[10px] sm:text-xs flex items-center justify-end",
                                        isAggregatedBurn
                                            ? "text-destructive"
                                            : holder.isVesting
                                            ? "text-purple-500"
                                            : "text-foreground/80"
                                    )}
                                >
                                    {formattedBalance}
                                </div>

                                {/* Percentage */}
                                <div className="col-span-3 text-right pr-2 flex items-center justify-end">
                                    <span
                                        className={cn(
                                            "font-mono text-[10px] sm:text-xs font-bold",
                                            isAggregatedBurn
                                                ? "text-destructive"
                                                : holder.isVesting
                                                ? "text-purple-500"
                                                : percentage >= 10
                                                ? "text-destructive"
                                                : percentage >= 5
                                                ? "text-yellow-500"
                                                : "text-foreground/60"
                                        )}
                                    >
                                        {percentage.toFixed(3)}%
                                    </span>
                                </div>
                            </div>
                        );

                        return (
                            <div
                                key={`${holder.account}-${
                                    holder.isVesting ? "vesting" : "regular"
                                }`}
                                className="relative group hover:bg-muted/5 transition-all duration-200"
                            >
                                {isAggregatedBurn && holder.burnBreakdown ? (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="cursor-help">
                                                    {rowContent}
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <div className="space-y-1 text-xs">
                                                    <div>
                                                        0x00...000:{" "}
                                                        {holder.burnBreakdown.zeroAddressPercent.toFixed(
                                                            1
                                                        )}
                                                        %
                                                    </div>
                                                    <div>
                                                        True Burn:{" "}
                                                        {holder.burnBreakdown.trueBurnPercent.toFixed(
                                                            1
                                                        )}
                                                        %
                                                    </div>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ) : (
                                    rowContent
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </ScrollArea>
    );
}
