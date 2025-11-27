export interface ActionTabsProps {
    actionType: "deposit" | "withdraw"
    setActionType: (value: "deposit" | "withdraw") => void
    stakedInDisplayUnit: number
}