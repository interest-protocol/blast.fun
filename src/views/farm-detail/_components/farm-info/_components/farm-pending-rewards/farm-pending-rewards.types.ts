export interface FarmPendingRewardsProps {
    pendingRewards: bigint
    rewardSymbol: string
    rewardDecimals: number
    isLoading: boolean
    isHarvesting: boolean
    refreshCountdown: number
    harvest: () => Promise<void>
    account?: string
}