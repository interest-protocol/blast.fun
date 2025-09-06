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

interface TokenTabsStore {
	tabs: TokenTab[]
	addTab: (tab: TokenTab) => void
	updateTab: (poolId: string, updates: Partial<TokenTab>) => void
	removeTab: (poolId: string) => void
	removeAllTabs: () => void
	getTab: (poolId: string) => TokenTab | undefined
}

export const useTokenTabs = create<TokenTabsStore>()(
	persist(
		(set, get) => ({
			tabs: [],

			addTab: (tab) =>
				set((state) => {
					const existingTab = state.tabs.find((t) => t.poolId === tab.poolId)
					if (existingTab) {
						return state
					}
					return {
						tabs: [...state.tabs, tab],
					}
				}),

			updateTab: (poolId, updates) =>
				set((state) => ({
					tabs: state.tabs.map((tab) => (tab.poolId === poolId ? { ...tab, ...updates } : tab)),
				})),

			removeTab: (poolId) =>
				set((state) => ({
					tabs: state.tabs.filter((t) => t.poolId !== poolId),
				})),

			removeAllTabs: () =>
				set({
					tabs: [],
				}),

			getTab: (poolId) => get().tabs.find((t) => t.poolId === poolId),
		}),
		{
			name: "token-tabs",
			partialize: (state) => ({ tabs: state.tabs }),
		}
	)
)
