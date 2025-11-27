import { ActionProps } from "../../farm-terminal.types"
export interface BalanceHeaderProps extends ActionProps {
    balance: number
    tokenSymbol: string
    onMaxClick: () => void
    disabled: boolean
    stakedInDisplayUnit: number
    tokenBalanceInDisplayUnit: number
}