import { Coins } from "lucide-react"
import { FC } from "react"

const EmptyState: FC = () => (
    <div className="flex flex-col items-center justify-center gap-4 py-32">
        <Coins className="h-12 w-12 text-muted-foreground/50" />
        <h2 className="text-xl font-bold">No Creator Rewards</h2>
        <p className="text-muted-foreground text-center max-w-md">
            You don't have any creator rewards to claim at the moment.
        </p>
    </div>
)

export default EmptyState
