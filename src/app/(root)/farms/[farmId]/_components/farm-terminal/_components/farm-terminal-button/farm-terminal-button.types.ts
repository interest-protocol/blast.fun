import { ActionProps } from "../../farm-terminal.types"

export interface FarmTerminalButtonProps extends ActionProps {
    amount: string
    isProcessing: boolean
    tokenBalanceInDisplayUnit: number
    stakedInDisplayUnit: number
    tokenSymbol: string
    handleDeposit: () => Promise<void>
    handleWithdraw: () => Promise<void>
}