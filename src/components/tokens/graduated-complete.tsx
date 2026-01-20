"use client";

import { memo, useCallback, useState, useMemo } from "react";
import { TokenCard } from "./token-card";
import { TokenListLayout } from "./token-list.layout";
import { TokenCardSkeleton } from "./token-card.skeleton";
import { Logo } from "@/components/ui/logo";
import { TokenListFilters } from "./token-list.filters";
import { useBondedTokens } from "@/hooks/use-tokens";
import { useTradeBump } from "@/hooks/use-trade-bump";
import type { TokenListSettings, TokenFilters, NexaToken } from "@/types/token";
import { sortTokens } from "@/utils/token-sorting";
import FlashBuyInput from "./flash-buy-input";

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

    // @dev: Build filter params for bonded tokens
    const filterParams = useMemo<TokenFilters>(() => {
        return {
            ...settings.filters,
            tabType: "bonded",
        };
    }, [settings.filters]);

    const { data, isLoading, error } = useBondedTokens(filterParams, {
        refetchInterval: pollInterval,
    });

    const filteredAndSortedTokens = useMemo(() => {
        if (!data || data.length === 0) return [];

        let tokens = [...data];

        // @dev: Apply additional client-side social filters if needed (backend doesn't support these)
        if (
            settings.filters.hasWebsite ||
            settings.filters.hasTwitter ||
            settings.filters.hasTelegram
        ) {
            tokens = tokens.filter((token) => {
                const metadata = token;
                if (!metadata) return false;

                if (
                    settings.filters.hasWebsite &&
                    (!metadata.website || metadata.website === "")
                )
                    return false;
                if (
                    settings.filters.hasTwitter &&
                    (!metadata.twitter || metadata.twitter === "")
                )
                    return false;
                if (
                    settings.filters.hasTelegram &&
                    (!metadata.telegram || metadata.telegram === "")
                )
                    return false;

                return true;
            });
        }

        // sort based on bump order, then apply normal sorting
        const sorted: ReadonlyArray<NexaToken> = [...tokens].sort((a, b) => {
            const aIndex = bumpOrder.indexOf(a.coinType);
            const bIndex = bumpOrder.indexOf(b.coinType);

            if (aIndex !== -1 && bIndex !== -1) {
                return aIndex - bIndex;
            }

            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;

            return 0;
        });

        // apply normal sorting to non-bumped tokens
        const bumped = sorted.filter((t) => bumpOrder.includes(t.coinType));
        const nonBumped = sorted.filter((t) => !bumpOrder.includes(t.coinType));
        const sortedNonBumped = sortTokens(nonBumped, settings.sortBy);

        return [...bumped, ...sortedNonBumped];
    }, [data, settings, bumpOrder]);

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

        if (isLoading) {
            return [...Array(8)].map((_, i) => <TokenCardSkeleton key={i} />);
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

        return filteredAndSortedTokens.map((pool) => (
            <TokenCard
                key={pool.coinType}
                pool={pool}
                hasRecentTrade={isAnimating(pool.coinType)}
                column="graduated"
            />
        ));
    }, [filteredAndSortedTokens, isLoading, error, isAnimating]);

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
            {renderContent()}
        </TokenListLayout>
    );
});
