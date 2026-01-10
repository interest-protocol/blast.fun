"use client";

import { memo, useRef, useCallback, useState, useMemo } from "react";
import { useVirtualizer } from '@tanstack/react-virtual';
import { TokenCard } from "./token-card";
import { TokenListLayout } from "./token-list.layout";
import { TokenCardSkeleton } from "./token-card.skeleton";
import { Logo } from "@/components/ui/logo";
import { TokenListFilters } from "./token-list.filters";
import { FlashBuyInput } from "./flash-buy-input";
import { useAboutToBondTokens } from "@/hooks/use-tokens";
import { useTradeBump } from "@/hooks/use-trade-bump";
import type { TokenListSettings, TokenFilters } from "@/types/token";
import { sortTokens } from "@/utils/token-sorting";
import { ScrollArea } from "@radix-ui/react-scroll-area";

interface NearGraduationProps {
	pollInterval?: number;
}

export const NearGraduation = memo(function NearGraduation({
	pollInterval = 10000,
}: NearGraduationProps) {
	const [settings, setSettings] = useState<TokenListSettings>({
		sortBy: "bondingProgress",
		filters: {
			tabType: 'about-to-bond'
		}
	});

	const { bumpOrder, isAnimating } = useTradeBump();

	const filterParams = useMemo<TokenFilters>(() => ({
		...settings.filters,
		tabType: 'about-to-bond'
	}), [settings.filters]);

	const { data, isLoading, error } = useAboutToBondTokens(filterParams, {
		refetchInterval: pollInterval
	});

	const filteredAndSortedTokens = useMemo(() => {
		if (!data || data.length === 0) return [];

		let tokens = [...data];

		if (settings.filters.hasWebsite || settings.filters.hasTwitter || settings.filters.hasTelegram) {
			tokens = tokens.filter((token) => {
				if (settings.filters.hasWebsite && (!token.website || token.website === '')) return false;
				if (settings.filters.hasTwitter && (!token.twitter || token.twitter === '')) return false;
				if (settings.filters.hasTelegram && (!token.telegram || token.telegram === '')) return false;
				return true;
			});
		}

		const sorted = [...tokens].sort((a, b) => {
			const aIndex = bumpOrder.indexOf(a.coinType);
			const bIndex = bumpOrder.indexOf(b.coinType);
			if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
			if (aIndex !== -1) return -1;
			if (bIndex !== -1) return 1;
			return 0;
		});

		const bumped = sorted.filter(t => bumpOrder.includes(t.coinType));
		const nonBumped = sorted.filter(t => !bumpOrder.includes(t.coinType));
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
						ERROR::LOADING::GRADUATING
					</p>
				</div>
			);
		}

		if (filteredAndSortedTokens.length === 0 && !isLoading) {
			return (
				<div className="p-8 text-center">
					<Logo className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
					<p className="font-mono text-xs uppercase text-muted-foreground">
						NO::TOKENS::GRADUATING
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
						column="nearGraduation"
						priority={virtualItem.index < 20}
					/>
				</div>
			);
		});
	}, [filteredAndSortedTokens, isLoading, error, isAnimating, rowVirtualizer]);

	return (
		<TokenListLayout
			title="NEAR GRADUATION"
			glowColor="pink"
			headerAction={
				<div className="flex items-center gap-2">
					<FlashBuyInput column="nearGraduation" />
					<TokenListFilters
						columnId="graduating"
						onSettingsChange={setSettings}
						defaultSort="bondingProgress"
						defaultTab="about-to-bond"
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