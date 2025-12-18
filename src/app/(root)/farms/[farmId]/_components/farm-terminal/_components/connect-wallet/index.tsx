import { FC } from "react"

import { ConnectWalletProps } from "./connect-wallet.types"
import { Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"

const ConnectWallet: FC<ConnectWalletProps> = ({ onConnect }) => (
    <div className="p-4">
        <div className="text-center space-y-2">
            <Wallet className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="font-mono text-xs text-muted-foreground">Connect wallet to stake</p>
            <Button
                size="sm"
                onClick={onConnect}
                className="font-mono uppercase tracking-wider mt-4"
            >
                Connect Wallet
            </Button>
        </div>
    </div>
)

export default ConnectWallet