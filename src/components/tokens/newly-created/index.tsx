"use client";

import { memo, useCallback, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { TokenCard } from "../token-card";
import TokenListLayout from "../token-list-layout";
import TokenCardSkeleton from "../token-card.skeleton";
import { Logo } from "@/components/ui/logo";
import TokenListFilters from "../token-list-filters";
import FlashBuyInput from "../flash-buy-input";

import { useTradeBump } from "@/hooks/use-trade-bump";
import { useCreatorsForList } from "@/hooks/use-creators-for-list";
import type { TokenListSettings } from "@/types/token";
import type { NoodlesCoinList } from "@/lib/noodles/client";
import { sortTokens } from "@/utils/token-sorting";

import type { NewlyCreatedProps } from "./newly-created.types";

async function fetchNewlyCreatedCoins(
    filters?: TokenListSettings["filters"],
): Promise<NoodlesCoinList[]> {
    const params = new URLSearchParams({
        isGraduated: "false",
        orderBy: "published_at",
        orderDirection: "desc",
        protocol: "blast-fun-bonding-curve",
    });

    if (filters?.hasWebsite) params.set("hasWebsite", "true");
    if (filters?.hasTwitter) params.set("hasX", "true");
    if (filters?.hasTelegram) params.set("hasTelegram", "true");

    const res = await fetch(`/api/coin/list?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch newly created coins");

    const json = await res.json();
    return json.coins ?? [];
}

export const NewlyCreated = memo(function NewlyCreated({
    pollInterval = 10000,
}: NewlyCreatedProps) {
    const [settings, setSettings] = useState<TokenListSettings>({
        sortBy: "date",
        filters: {
            tabType: "newly-created",
        },
    });
    const { bumpOrder, isAnimating } = useTradeBump();

    const { data, isLoading, error } = useQuery({
        queryKey: ["coins", "newly-created", settings.filters],
        queryFn: () => fetchNewlyCreatedCoins(settings.filters),
        refetchInterval: pollInterval,
        staleTime: 1000,
        gcTime: 5000,
    });

    const filteredAndSortedTokens = useMemo(() => {
        if (!data || data.length === 0) return [];

        const sorted = [...data].sort((a, b) => {
            const aIndex = bumpOrder.indexOf(a.coinType);
            const bIndex = bumpOrder.indexOf(b.coinType);

            if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;
            return 0;
        });

        const bumped = sorted.filter((t) => bumpOrder.includes(t.coinType));
        const nonBumped = sorted.filter((t) => !bumpOrder.includes(t.coinType));
        const sortedNonBumped = sortTokens(nonBumped, settings.sortBy);

        return [...bumped, ...sortedNonBumped];
    }, [data, settings.sortBy, bumpOrder]);

    const creatorsMap = useCreatorsForList(filteredAndSortedTokens);

    const renderContent = useCallback(() => {
        if (error) {
            return (
                <div className="p-8 text-center">
                    <Logo className="w-8 h-8 mx-auto text-destructive mb-2" />
                    <p className="font-mono text-xs uppercase text-destructive">
                        ERROR::LOADING::FEED
                    </p>
                </div>
            );
        }

        if (isLoading) {
            return [...Array(8)].map((_, i) => <TokenCardSkeleton key={i} />);
        }

        return filteredAndSortedTokens.map((coin) => {
            const creator = creatorsMap[coin.coinType];
            const pool = {
                ...coin,
                dev: creator?.address ?? (coin as { dev?: string }).dev,
                creatorData: creator,
            };
            return (
                <TokenCard
                    key={coin.coinType}
                    pool={pool}
                    hasRecentTrade={isAnimating(coin.coinType)}
                    column="newlyCreated"
                />
            );
        });
    }, [filteredAndSortedTokens, creatorsMap, isLoading, error, isAnimating]);

    return (
        <TokenListLayout
            title="NEWLY CREATED"
            glowColor="blue"
            headerAction={
                <div className="flex items-center gap-2">
                    <FlashBuyInput column="newlyCreated" />
                    <TokenListFilters
                        columnId="new"
                        onSettingsChange={setSettings}
                        defaultSort="date"
                        defaultTab="newly-created"
                    />
                </div>
            }
        >
            {renderContent()}
        </TokenListLayout>
    );
});
