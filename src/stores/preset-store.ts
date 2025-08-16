import { create } from "zustand"
import { persist } from "zustand/middleware"

interface PresetStore {
	slippage: number
	quickBuyAmounts: number[]
	quickSellPercentages: number[]

	// actions
	setSlippage: (slippage: number) => void
	setQuickBuyAmounts: (amounts: number[]) => void
	setQuickSellPercentages: (percentages: number[]) => void
	resetToDefaults: () => void
}

export const usePresetStore = create<PresetStore>()(
	persist(
		(set) => ({
			slippage: 5,
			quickBuyAmounts: [1, 10, 50, 100],
			quickSellPercentages: [25, 50, 75, 100],

			setSlippage: (slippage) => set({ slippage }),
			setQuickBuyAmounts: (amounts) => set({ quickBuyAmounts: amounts }),
			setQuickSellPercentages: (percentages) => set({ quickSellPercentages: percentages }),

			resetToDefaults: () =>
				set({
					slippage: 5,
					quickBuyAmounts: [1, 10, 50, 100],
					quickSellPercentages: [25, 50, 75, 100],
				}),
		}),
		{
			name: "trade-settings",
		}
	)
)