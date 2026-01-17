export interface QuickAmountsProps {
    isProcessing: boolean
    stakedInDisplayUnit: number
    actionType: "deposit" | "withdraw"
    onSelect: (percentage: number) => void
}