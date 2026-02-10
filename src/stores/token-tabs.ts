import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface TokenTab {
	poolId: string
	name: string
	symbol: string
	iconUrl?: string | null
	bondingCurve: number
	coinType?: string
}

function tabRouteParam(tab: TokenTab): string {
	return tab.poolId || tab.coinType || ""
}

interface TokenTabsStore {
	tabs: TokenTab[]
	addTab: (tab: TokenTab) => void
	updateTab: (routeParam: string, updates: Partial<TokenTab>) => void
	removeTab: (routeParam: string) => void
	removeAllTabs: () => void
	getTab: (routeParam: string) => TokenTab | undefined
}

export const useTokenTabs = create<TokenTabsStore>()(
	persist(
		(set, get) => ({
			tabs: [],

			addTab: (tab) =>
				set((state) => {
					const id = tabRouteParam(tab)
					if (!id) return state
					const existingTab = state.tabs.find((t) => tabRouteParam(t) === id)
					if (existingTab) return state
					return { tabs: [...state.tabs, tab] }
				}),

			updateTab: (routeParam, updates) =>
				set((state) => ({
					tabs: state.tabs.map((tab) =>
						tabRouteParam(tab) === routeParam ? { ...tab, ...updates } : tab
					),
				})),

			removeTab: (routeParam) =>
				set((state) => ({
					tabs: state.tabs.filter((t) => tabRouteParam(t) !== routeParam),
				})),

			removeAllTabs: () =>
				set({
					tabs: [],
				}),

			getTab: (routeParam) =>
				get().tabs.find((t) => tabRouteParam(t) === routeParam),
		}),
		{
			name: "token-tabs",
			partialize: (state) => ({ tabs: state.tabs }),
		}
	)
)