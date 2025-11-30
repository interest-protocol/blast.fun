import { FC } from 'react'

import { FarmStakeProps } from './farm-stake.types'
import { formatNumberWithSuffix } from '@/utils/format'

const FarmStake: FC<FarmStakeProps> = ({ stakedAmount, tokenSymbol, stakedUsd, stakeTokenPrice, staked }) => (
    <div className="hidden md:flex flex-col items-end min-w-[120px]">
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Your Stake</p>
        <p className="font-mono text-sm font-semibold">{formatNumberWithSuffix(stakedAmount)} {tokenSymbol}</p>
        {stakeTokenPrice > 0 && staked > 0n && (
            <p className="font-mono text-xs text-muted-foreground">${formatNumberWithSuffix(stakedUsd)}</p>
        )}
    </div>
)

export default FarmStake

