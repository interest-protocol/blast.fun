export interface BalanceHeaderProps {
    actionType: "deposit" | "withdraw"
    balance: number
    tokenSymbol: string
    onMaxClick: () => void
    disabled: boolean
    stakedInDisplayUnit: number
    tokenBalanceInDisplayUnit: number
}