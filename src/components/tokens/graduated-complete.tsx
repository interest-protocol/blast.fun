"use client";

import { memo, useRef, useCallback, useState, useMemo } from "react";
import { useVirtualizer } from '@tanstack/react-virtual';
import { TokenCard } from "./token-card";
import { TokenListLayout } from "./token-list.layout";
import { TokenCardSkeleton } from "./token-card.skeleton";
import { Logo } from "@/components/ui/logo";
import { TokenListFilters } from "./token-list.filters";
import { FlashBuyInput } from "./flash-buy-input";
import { useBondedTokens } from "@/hooks/use-tokens";
import { useTradeBump } from "@/hooks/use-trade-bump";
import type { TokenListSettings, TokenFilters, NexaToken } from "@/types/token";
import { sortTokens } from "@/utils/token-sorting";
import { ScrollArea } from "@radix-ui/react-scroll-area";

interface GraduatedCompleteProps {
    pollInterval?: number;
}

export const GraduatedComplete = memo(function GraduatedComplete({
    pollInterval = 30000,
}: GraduatedCompleteProps) {
    const [settings, setSettings] = useState<TokenListSettings>({
        sortBy: "marketCap",
        filters: {
            tabType: "bonded",
        },
    });

    const { bumpOrder, isAnimating } = useTradeBump();

    const filterParams = useMemo<TokenFilters>(() => ({
        ...settings.filters,
        tabType: "bonded",
    }), [settings.filters]);

    const { data, isLoading, error } = useBondedTokens(filterParams, {
        refetchInterval: pollInterval,
    });

    const filteredAndSortedTokens = useMemo(() => {
        if (!data || data.length === 0) return [];

        let tokens = [...data];

        if (settings.filters.hasWebsite || settings.filters.hasTwitter || settings.filters.hasTelegram) {
            tokens = tokens.filter((token) => {
                const metadata = token;
                if (!metadata) return false;
                if (settings.filters.hasWebsite && (!metadata.website || metadata.website === "")) return false;
                if (settings.filters.hasTwitter && (!metadata.twitter || metadata.twitter === "")) return false;
                if (settings.filters.hasTelegram && (!metadata.telegram || metadata.telegram === "")) return false;
                return true;
            });
        }

        const sorted: ReadonlyArray<NexaToken> = [...tokens].sort((a, b) => {
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
    }, [data, settings, bumpOrder]);

    const parentRef = useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
        count: isLoading ? 10 : filteredAndSortedTokens.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 76,
        overscan: 8,
    });

    const renderContent = useCallback(() => {
        if (error) {
            return (
                <div className="p-8 text-center">
                    <Logo className="w-8 h-8 mx-auto text-destructive mb-2" />
                    <p className="font-mono text-xs uppercase text-destructive">
                        ERROR::LOADING::GRADUATED
                    </p>
                </div>
            );
        }

        if (filteredAndSortedTokens.length === 0 && !isLoading) {
            return (
                <div className="p-8 text-center">
                    <Logo className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="font-mono text-xs uppercase text-muted-foreground">
                        NO::GRADUATED::TOKENS
                    </p>
                </div>
            );
        }

        if (isLoading) {
            return rowVirtualizer.getVirtualItems().map((virtualItem) => (
                <div
                    key={virtualItem.key}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualItem.size}px`,
                        transform: `translateY(${virtualItem.start}px)`,
                    }}
                >
                    <TokenCardSkeleton />
                </div>
            ));
        }

        return rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const pool = filteredAndSortedTokens[virtualItem.index];

            return (
                <div
                    key={pool.coinType}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualItem.size}px`,
                        transform: `translateY(${virtualItem.start}px)`,
                    }}
                >
                    <TokenCard
                        pool={pool}
                        hasRecentTrade={isAnimating(pool.coinType)}
                        column="graduated"
                        priority={virtualItem.index < 20}
                    />
                </div>
            );
        });
    }, [filteredAndSortedTokens, isLoading, error, isAnimating, rowVirtualizer]);

    return (
        <TokenListLayout
            title="GRADUATED"
            glowColor="gold"
            headerAction={
                <div className="flex items-center gap-2">
                    <FlashBuyInput column="graduated" />
                    <TokenListFilters
                        columnId="graduated"
                        onSettingsChange={setSettings}
                        defaultSort="marketCap"
                        defaultTab="bonded"
                    />
                </div>
            }
        >
            <ScrollArea className="h-full">
                <div ref={parentRef} className="h-full">
                    <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
                        {renderContent()}
                    </div>
                </div>
            </ScrollArea>
        </TokenListLayout>
    );
});