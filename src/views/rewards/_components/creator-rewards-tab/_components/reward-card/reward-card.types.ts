export interface RewardCardProps {
    reward: any
    isClaiming: boolean
    isTransferring: boolean
    onTransfer: () => void
    onClaim: () => void
}