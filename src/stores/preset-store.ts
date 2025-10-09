import { create } from "zustand"
import { persist } from "zustand/middleware"

interface PresetStore {
	slippage: number
	quickBuyAmounts: number[]
	quickSellPercentages: number[]
	flashBuyAmounts: {
		newlyCreated: number
		nearGraduation: number
		graduated: number
	}

	// actions
	setSlippage: (slippage: number) => void
	setQuickBuyAmounts: (amounts: number[]) => void
	setQuickSellPercentages: (percentages: number[]) => void
	setFlashBuyAmount: (column: 'newlyCreated' | 'nearGraduation' | 'graduated', amount: number) => void
	resetToDefaults: () => void
}

export const usePresetStore = create<PresetStore>()(
	persist(
		(set) => ({
			slippage: 5,
			quickBuyAmounts: [1, 10, 50, 100],
			quickSellPercentages: [25, 50, 75, 100],
			flashBuyAmounts: {
				newlyCreated: 5,
				nearGraduation: 5,
				graduated: 5,
			},

			setSlippage: (slippage) => set({ slippage }),
			setQuickBuyAmounts: (amounts) => set({ quickBuyAmounts: amounts }),
			setQuickSellPercentages: (percentages) => set({ quickSellPercentages: percentages }),
			setFlashBuyAmount: (column, amount) => set((state) => ({
				flashBuyAmounts: {
					...state.flashBuyAmounts,
					[column]: amount
				}
			})),

			resetToDefaults: () =>
				set({
					slippage: 5,
					quickBuyAmounts: [1, 10, 50, 100],
					quickSellPercentages: [25, 50, 75, 100],
					flashBuyAmounts: {
						newlyCreated: 5,
						nearGraduation: 5,
						graduated: 5,
					},
				}),
		}),
		{
			name: "trade-settings",
		}
	)
)
