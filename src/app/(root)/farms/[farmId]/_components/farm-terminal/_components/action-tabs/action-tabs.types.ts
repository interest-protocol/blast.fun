import { ActionProps, ActionType } from "../../farm-terminal.types"
export interface ActionTabsProps extends ActionProps {
    setActionType: (value: ActionType) => void
    stakedInDisplayUnit: number
}