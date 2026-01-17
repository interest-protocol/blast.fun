import { FC } from "react"
import { Coins } from "lucide-react"

import { Button } from "@/components/ui/button"
import { NotConnectedStateProps } from "./not-connect-state.types"

const NotConnectedState: FC<NotConnectedStateProps> = ({ onConnect }) => (
    <div className="flex flex-col items-center justify-center gap-4 py-32">
        <Coins className="h-12 w-12 text-muted-foreground/50" />
        <h2 className="text-xl font-bold">Creator Rewards</h2>
        <p className="text-muted-foreground text-center max-w-md">
            Connect your wallet to view and claim your creator rewards from liquidity positions.
        </p>
        <Button onClick={onConnect}>Connect Wallet</Button>
    </div>
)

export default NotConnectedState
