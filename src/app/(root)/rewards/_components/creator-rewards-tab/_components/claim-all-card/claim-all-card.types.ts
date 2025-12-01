export interface ClaimAllProps {
    totalClaimable: number
    positions: number
    isClaimingAll: boolean
    isAnyClaiming: boolean
    onClaimAll: () => void
}