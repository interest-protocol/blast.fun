"use client";

import { memo, useCallback, useState, useMemo } from "react";

import { TokenCard } from "../token-card";
import FlashBuyInput from "../flash-buy-input";
import { sortTokens } from "@/utils/token-sorting";
import { useBondedTokens } from "@/hooks/use-tokens";
import { useTradeBump } from "@/hooks/use-trade-bump";
import { TokenListLayout } from "../token-list.layout";
import { TokenListFilters } from "../token-list.filters";

import { GraduatedCompleteProps } from "./graduated-complete.types";
import type { TokenListSettings, TokenFilters, NexaToken } from "@/types/token";
import { ErrorState } from "./_components/error-state";
import { LoadingState } from "./_components/loading-state";
import EmptyState from "@/views/rewards/_components/creator-rewards-tab/_components/empty-state";

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
    
    const handleSettingsChange = useCallback((newSettings: TokenListSettings) => {
        setSettings(newSettings);
    }, []);
    
    const filterParams = useMemo<TokenFilters>(() => ({
        ...settings.filters,
        tabType: "bonded",
    }), [settings.filters]);

    const optimizedPollInterval = useMemo(() => 
        Math.max(pollInterval, 10000), 
    [pollInterval]);

    const { data, isLoading, error } = useBondedTokens(filterParams, {
        refetchInterval: optimizedPollInterval,
    });

    const bumpSet = useMemo(() => new Set(bumpOrder), [bumpOrder]);

    const animatingTokens = useMemo(() => {
        const set = new Set<string>();
        bumpOrder.forEach(coinType => {
            if (isAnimating(coinType)) {
                set.add(coinType);
            }
        });
        return set;
    }, [bumpOrder, isAnimating]);

    const filteredAndSortedTokens = useMemo(() => {
        if (!data?.length) return [];

        const bumped: NexaToken[] = [];
        const nonBumped: NexaToken[] = [];
        
        for (const token of data) {
            // Aplicar filtros sociais
            if (settings.filters.hasWebsite && (!token.website || token.website === "")) {
                continue;
            }
            if (settings.filters.hasTwitter && (!token.twitter || token.twitter === "")) {
                continue;
            }
            if (settings.filters.hasTelegram && (!token.telegram || token.telegram === "")) {
                continue;
            }
            
            if (bumpSet.has(token.coinType)) {
                bumped.push(token);
            } else {
                nonBumped.push(token);
            }
        }
        
        bumped.sort((a, b) => {
            const aIndex = bumpOrder.indexOf(a.coinType);
            const bIndex = bumpOrder.indexOf(b.coinType);
            return aIndex - bIndex;
        });
        
        const sortedNonBumped = sortTokens(nonBumped, settings.sortBy);
        
        return [...bumped, ...sortedNonBumped];
    }, [data, settings.filters, settings.sortBy, bumpOrder, bumpSet]);

    const renderContent = useCallback(() => {
        if (error) {
            return <ErrorState />;
        }

        if (isLoading) {
            return <LoadingState />;
        }

        if (filteredAndSortedTokens.length === 0) {
            return <EmptyState />;
        }

        return filteredAndSortedTokens.map((pool) => (
            <TokenCard
                key={pool.coinType}
                pool={pool}
                hasRecentTrade={animatingTokens.has(pool.coinType)}
                column="graduated"
            />
        ));
    }, [filteredAndSortedTokens, isLoading, error, animatingTokens]);

    return (
        <TokenListLayout
            title="GRADUATED"
            glowColor="gold"
            headerAction={
                <div className="flex items-center gap-2">
                    <FlashBuyInput column="graduated" />
                    <TokenListFilters
                        columnId="graduated"
                        onSettingsChange={handleSettingsChange}
                        defaultSort="marketCap"
                        defaultTab="bonded"
                    />
                </div>
            }
        >
            {renderContent()}
        </TokenListLayout>
    );
});