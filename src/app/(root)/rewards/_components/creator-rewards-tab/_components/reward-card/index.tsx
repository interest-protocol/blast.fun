import { FC } from "react"
import { Loader2 } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TokenAvatar } from "@/components/tokens/token-avatar"
import { formatNumberWithSuffix } from "@/utils/format"
import { RewardCardProps } from "./reward-card.types"

const RewardCard: FC<RewardCardProps> = ({ reward, isClaiming, isTransferring, onTransfer, onClaim }) => {
    const amount = Number(reward.estimatedRewards || 0)

    return (
        <Card className="p-4 flex flex-col items-center text-center hover:border-foreground/20 transition-colors">
            <TokenAvatar
                iconUrl={reward.memeCoinIconUrl}
                symbol={reward.memeCoinSymbol}
                name={reward.memeCoinName}
                className="size-16 rounded-lg"
                enableHover={false}
            />

            <div className="flex-1 w-full">
                <h3 className="font-bold text-base font-mono uppercase truncate mb-0.5">
                    {reward.memeCoinName || "Unknown Token"}
                </h3>
                <p className="text-xs text-muted-foreground font-mono mb-2">
                    {reward.memeCoinSymbol || "---"}
                </p>

                <div className="py-2 px-3 rounded-md bg-muted/50 border">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                        Rewards
                    </p>
                    <div className="flex items-center justify-center gap-1.5">
                        <span className="text-xl font-bold font-mono">
                            {formatNumberWithSuffix(amount)}
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground">SUI</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-2 w-full mt-3">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-initial"
                    disabled={isTransferring}
                    onClick={onTransfer}
                >
                    {isTransferring ? <Loader2 className="h-4 w-4 animate-spin" /> : "Transfer"}
                </Button>

                <Button
                    size="sm"
                    className="flex-1"
                    disabled={isClaiming || amount === 0}
                    onClick={onClaim}
                >
                    {isClaiming ? <Loader2 className="h-4 w-4 animate-spin" /> : "Claim"}
                </Button>
            </div>
        </Card>
    )
}

export default RewardCard