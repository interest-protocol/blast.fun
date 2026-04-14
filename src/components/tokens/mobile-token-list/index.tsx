"use client";

import { memo, useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { TokenCard } from "../token-card";
import TokenCardSkeleton from "../token-card.skeleton";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import TokenListFilters from "../token-list-filters";
import { useTradeBump } from "@/hooks/use-trade-bump";
import { useCreatorsForList } from "@/hooks/use-creators-for-list";
import type { TokenListSettings, TokenSortOption } from "@/types/token";
import type { NoodlesCoinList } from "@/lib/noodles/client";
import { cn } from "@/utils";
import { sortTokens } from "@/utils/token-sorting";

type TabType = "new" | "graduating" | "graduated";

interface TabData {
	key: TabType;
	label: string;
	pollInterval: number;
}

const TABS: TabData[] = [
	{
		key: "new",
		label: "NEW",
		pollInterval: 10000,
	},
	{
		key: "graduating",
		label: "BONDING",
		pollInterval: 10000,
	},
	{
		key: "graduated",
		label: "BONDED",
		pollInterval: 30000,
	},
];

async function fetchCoinsForTab(tab: TabType, filters?: TokenListSettings["filters"]): Promise<NoodlesCoinList[]> {
	const params = new URLSearchParams();

	params.set("protocol", "blast-fun-bonding-curve");

	if (tab === "new") {
		params.set("isGraduated", "false");
		params.set("orderBy", "published_at");
		params.set("orderDirection", "desc");
	} else if (tab === "graduating") {
		params.set("isGraduated", "false");
		params.set("orderBy", "bonding_curve_progress");
		params.set("orderDirection", "desc");
		params.set("bondingCurveProgressMin", "30");
	} else if (tab === "graduated") {
		params.set("isGraduated", "true");
	}

	if (filters?.hasWebsite) params.set("hasWebsite", "true");
	if (filters?.hasTwitter) params.set("hasX", "true");
	if (filters?.hasTelegram) params.set("hasTelegram", "true");

	const res = await fetch(`/api/coin/list?${params.toString()}`);
	if (!res.ok) throw new Error("Failed to fetch coins");

	const json = await res.json();
	return json.coins ?? [];
}

const TabContent = memo(function TabContent({ tab, settings }: { tab: TabData; settings: TokenListSettings }) {
	const { bumpOrder, isAnimating } = useTradeBump();

	const { data, isLoading, error } = useQuery<NoodlesCoinList[]>({
		queryKey: ["coins", "mobile", tab.key, settings.filters],
		queryFn: () => fetchCoinsForTab(tab.key, settings.filters),
		refetchInterval: tab.pollInterval,
		staleTime: 1000,
		gcTime: 5000,
	});

	const sortedTokens = useMemo(() => {
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

	const creatorsMap = useCreatorsForList(sortedTokens);

	if (error) {
		return (
			<div className="p-8 text-center">
				<Logo className="w-8 h-8 mx-auto text-destructive mb-2" />
				<p className="font-mono text-xs uppercase text-destructive">ERROR::LOADING::TOKENS</p>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="space-y-2">
				{[...Array(6)].map((_, i) => (
					<TokenCardSkeleton key={i} />
				))}
			</div>
		);
	}

	if (sortedTokens.length === 0) {
		return (
			<div className="p-8 text-center">
				<Logo className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
				<p className="font-mono text-xs uppercase text-muted-foreground">NO::TOKENS::FOUND</p>
			</div>
		);
	}

	const column: "newlyCreated" | "nearGraduation" | "graduated" =
		tab.key === "new" ? "newlyCreated" : tab.key === "graduating" ? "nearGraduation" : "graduated";

	return (
		<div className="space-y-2">
			{sortedTokens.map((coin) => {
				const creator = creatorsMap[coin.coinType];
				const pool = {
					...coin,
					dev: creator?.address ?? (coin as { dev?: string }).dev,
					creatorData: creator,
				};
				return (
					<TokenCard key={coin.coinType} pool={pool} hasRecentTrade={isAnimating(coin.coinType)} column={column} />
				);
			})}
		</div>
	);
});

export const MobileTokenList = memo(function MobileTokenList() {
	const [activeTab, setActiveTab] = useState<TabType>("new");
	const [settings, setSettings] = useState<TokenListSettings>({
		sortBy: "date",
		filters: {
			tabType: "newly-created",
		},
	});

	const handleTabChange = useCallback((tab: TabType) => {
		setActiveTab(tab);
		const tabType = tab === "graduating" ? "about-to-bond" : tab === "graduated" ? "bonded" : "newly-created";
		setSettings((prev) => ({
			...prev,
			filters: {
				...prev.filters,
				tabType,
			},
		}));
	}, []);

	const getDefaultSort = useCallback((tab: TabType): TokenSortOption => {
		if (tab === "graduating") return "bondingProgress";
		if (tab === "graduated") return "marketCap";
		return "date";
	}, []);

	const activeTabData = useMemo(() => {
		return TABS.find((t) => t.key === activeTab) ?? TABS[0];
	}, [activeTab]);

	return (
		<div className="h-screen flex flex-col">
			<div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
				<div className="flex gap-1">
					{TABS.map((tab) => (
						<Button
							key={tab.key}
							variant="ghost"
							size="sm"
							onClick={() => handleTabChange(tab.key)}
							className={cn(
								"font-mono text-xs uppercase transition-all",
								activeTab === tab.key ? "text-primary" : "text-muted-foreground hover:text-white"
							)}
						>
							{tab.label}
						</Button>
					))}
				</div>

				<TokenListFilters
					columnId="mobile"
					onSettingsChange={setSettings}
					defaultSort={getDefaultSort(activeTab)}
					defaultTab={
						activeTab === "graduating" ? "about-to-bond" : activeTab === "graduated" ? "bonded" : "newly-created"
					}
				/>
			</div>

			<div className="flex-1 overflow-y-auto pb-[12rem]">
				<TabContent key={activeTab} tab={activeTabData} settings={settings} />
			</div>
		</div>
	);
});
