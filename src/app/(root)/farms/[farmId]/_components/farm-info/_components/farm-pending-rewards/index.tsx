import { FC } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { formatNumberWithSuffix } from "@/utils/format"
import { FarmPendingRewardsProps } from "./farm-pending-rewards.types"

const FarmPendingRewards: FC<FarmPendingRewardsProps> = ({
    pendingRewards,
    rewardSymbol,
    rewardDecimals,
    isHarvesting,
    refreshCountdown,
    harvest,
    account
}) => (
    <div className="p-3 sm:p-4 rounded-lg border shadow-sm bg-muted/10">
        <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Pending Rewards</p>
            <div className="relative w-4 h-4">
                <svg className="w-4 h-4 -rotate-90" viewBox="0 0 36 36">
                    <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        className="stroke-muted-foreground/20"
                        strokeWidth="3"
                    />
                    <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        className="stroke-blue-400"
                        strokeWidth="3"
                        strokeDasharray="100"
                        strokeDashoffset={100 - (refreshCountdown / 60) * 100}
                        strokeLinecap="round"
                    />
                </svg>
            </div>
        </div>
        <div className="flex items-center justify-between gap-2">
            <div>
                <p className="font-mono text-base sm:text-lg font-semibold text-blue-400">
                    {formatNumberWithSuffix(Number(pendingRewards) / Math.pow(10, rewardDecimals))}
                </p>
                <p className="font-mono text-xs text-muted-foreground mt-0.5">{rewardSymbol}</p>
            </div>
            {pendingRewards > 0n && (
                <Button
                    onClick={harvest}
                    disabled={isHarvesting || !account}
                    size="sm"
                    className="font-mono uppercase tracking-wider text-xs h-7 sm:h-8 px-2 sm:px-3 whitespace-nowrap"
                >
                    {isHarvesting ? (
                        <>
                            <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                            Harvesting...
                        </>
                    ) : (
                        "Harvest"
                    )}
                </Button>
            )}
        </div>
    </div>
)

export default FarmPendingRewards
