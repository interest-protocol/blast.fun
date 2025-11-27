export interface FarmTerminalButtonProps {
    actionType: "deposit" | "withdraw"
    amount: string
    isProcessing: boolean
    tokenBalanceInDisplayUnit: number
    stakedInDisplayUnit: number
    tokenSymbol: string
    handleDeposit: () => Promise<void>
    handleWithdraw: () => Promise<void>
}