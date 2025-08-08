import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface TokenTab {
	poolId: string
	name: string
	symbol: string
	iconUrl?: string | null
	bondingCurve: number
}

interface TokenTabsStore {
	tabs: TokenTab[]
	activeTabId: string | null
	addTab: (tab: TokenTab) => void
	removeTab: (poolId: string) => void
	removeAllTabs: () => void
	setActiveTab: (poolId: string) => void
	getTab: (poolId: string) => TokenTab | undefined
}

export const useTokenTabs = create<TokenTabsStore>()(
	persist(
		(set, get) => ({
			tabs: [],
			activeTabId: null,

			addTab: (tab) =>
				set((state) => {
					const existingTab = state.tabs.find((t) => t.poolId === tab.poolId)
					if (existingTab) {
						return { ...state, activeTabId: tab.poolId }
					}
					return {
						tabs: [...state.tabs, tab],
						activeTabId: tab.poolId,
					}
				}),

			removeTab: (poolId) =>
				set((state) => {
					const newTabs = state.tabs.filter((t) => t.poolId !== poolId)
					let newActiveId = state.activeTabId

					if (state.activeTabId === poolId) {
						const currentIndex = state.tabs.findIndex((t) => t.poolId === poolId)
						if (newTabs.length > 0) {
							const nextIndex = Math.min(currentIndex, newTabs.length - 1)
							newActiveId = newTabs[nextIndex]?.poolId || null
						} else {
							newActiveId = null
						}
					}

					return {
						tabs: newTabs,
						activeTabId: newActiveId,
					}
				}),

			removeAllTabs: () =>
				set({
					tabs: [],
					activeTabId: null,
				}),

			setActiveTab: (poolId) =>
				set((state) => ({
					activeTabId: state.tabs.some((t) => t.poolId === poolId) ? poolId : state.activeTabId,
				})),

			getTab: (poolId) => get().tabs.find((t) => t.poolId === poolId),
		}),
		{
			name: "token-tabs-storage",
			partialize: (state) => ({ tabs: state.tabs, activeTabId: state.activeTabId }),
		}
	)
)