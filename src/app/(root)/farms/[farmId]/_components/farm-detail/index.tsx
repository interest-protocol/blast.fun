"use client";

import { FC, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/context/app.context";
import { farmsSdk } from "@/lib/farms";
import type { InterestFarm, InterestAccount } from "@interest-protocol/farms";
import { coinMetadataApi, CoinMetadata } from "@/lib/coin-metadata-api";
import { formatNumberWithSuffix } from "@/utils/format";
import { FarmDetailProps } from "./farm-detail.types";
import FarmInfo from "../farm-info";
import FarmTerminal from "../farm-terminal";

const FarmDetail: FC<FarmDetailProps> = ({ farmId }) => {
    const router = useRouter();
    const { address, isConnected } = useApp();
    const [farm, setFarm] = useState<InterestFarm | null>(null);
    const [farmAccounts, setFarmAccounts] = useState<InterestAccount[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<InterestAccount | undefined>(undefined);
    const [metadata, setMetadata] = useState<CoinMetadata | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchFarmData = useCallback(async () => {
        setIsLoading(true);
        try {
            const farmData = await farmsSdk.getFarm(farmId);
            setFarm(farmData);

            if (address && isConnected) {
                const allAccounts = await farmsSdk.getAccounts(address);
                const accounts = allAccounts.filter((acc) => acc.farm === farmId);
                const sorted = [...accounts].sort((a, b) => {
                    if (a.stakeBalance === b.stakeBalance) return 0;
                    return a.stakeBalance > b.stakeBalance ? -1 : 1;
                });
                setFarmAccounts(sorted);
                setSelectedAccount((prev) => {
                    if (sorted.length === 0) return undefined;
                    const kept = sorted.find((a) => a.objectId === prev?.objectId);
                    return kept ?? sorted[0];
                });
            } else {
                setFarmAccounts([]);
                setSelectedAccount(undefined);
            }

            const meta = await coinMetadataApi.getCoinMetadata(
                farmData.stakeCoinType,
            );
            setMetadata(meta);
        } catch (error) {
            console.error("Failed to fetch farm data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [farmId, address, isConnected]);

    useEffect(() => {
        fetchFarmData();
    }, [fetchFarmData]);

    if (isLoading || !farm) {
        return (
            <div className="container max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-8">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    const tokenSymbol = metadata?.symbol ?? "TOKEN";

    return (
        <div className="container max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-8">
            <div className="space-y-4 md:space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/farms")}
                        className="font-mono"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    {isConnected && farmAccounts.length > 0 && (
                        <Select
                            value={selectedAccount?.objectId ?? ""}
                            onValueChange={(objectId) => {
                                const acc = farmAccounts.find((a) => a.objectId === objectId);
                                if (acc) setSelectedAccount(acc);
                            }}
                        >
                            <SelectTrigger className="w-auto min-w-[220px] font-mono" aria-label="Conta da farm para depósito, stake e withdraw">
                                <SelectValue placeholder="Escolher conta" />
                            </SelectTrigger>
                            <SelectContent>
                                {farmAccounts.map((acc, i) => {
                                    const staked = Number(acc.stakeBalance) / 1e9;
                                    return (
                                        <SelectItem key={acc.objectId} value={acc.objectId}>
                                            Account {i + 1} · {formatNumberWithSuffix(staked)} {tokenSymbol}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    )}
                </div>

                <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
                    <div className="w-full lg:w-auto lg:min-w-[480px] border border-border/80 rounded-lg bg-card/50 shadow-md backdrop-blur-sm">
                        <FarmTerminal
                            farm={farm}
                            account={selectedAccount}
                            metadata={metadata}
                            onOperationSuccess={fetchFarmData}
                        />
                    </div>

                    <div className="w-full lg:flex-1">
                        <FarmInfo
                            farm={farm}
                            account={selectedAccount}
                            metadata={metadata}
                            onOperationSuccess={fetchFarmData}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FarmDetail;
