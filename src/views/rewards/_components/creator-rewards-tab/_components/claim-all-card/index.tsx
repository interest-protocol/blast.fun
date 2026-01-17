import { FC } from "react"
import { Coins, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { formatNumberWithSuffix } from "@/utils/format"
import { ClaimAllProps } from "./claim-all-card.types"

const ClaimAllCard: FC<ClaimAllProps> = ({
    totalClaimable,
    positions,
    isClaimingAll,
    isAnyClaiming,
    onClaimAll
}) => {
    const hasClaimable = totalClaimable > 0

    return (
        <Card className="p-4 flex flex-col items-center text-center hover:border-foreground/20 transition-colors">
            <div className="size-16 rounded-lg bg-primary/10 flex items-center justify-center">
                <Coins className="size-8 text-primary" />
            </div>

            <div className="flex-1 w-full">
                <h3 className="font-bold text-base font-mono uppercase truncate mb-0.5">
                    All Positions
                </h3>
                <p className="text-xs text-muted-foreground font-mono mb-2">
                    {positions} {positions === 1 ? "position" : "positions"}
                </p>

                <div className="py-2 px-3 rounded-md bg-muted/50 border">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                        Total Rewards
                    </p>
                    <div className="flex items-center justify-center gap-1.5">
                        <span className="text-xl font-bold font-mono">
                            {formatNumberWithSuffix(totalClaimable)}
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground">SUI</span>
                    </div>
                </div>
            </div>

            <Button
                size="sm"
                className="w-full mt-3"
                onClick={onClaimAll}
                disabled={!hasClaimable || isClaimingAll || isAnyClaiming}
            >
                {isClaimingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : "Claim All"}
            </Button>
        </Card>
    )
}
export default ClaimAllCard