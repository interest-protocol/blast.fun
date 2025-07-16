import { useApp } from "@/context/app.context";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '../ui/dialog';
import { Button } from "../ui/button";
import { WalletList } from "../shared/wallet-list";

export function AuthenticationDialog() {
    const {
        isConnecting,

        isConnectDialogOpen,
        setIsConnectDialogOpen,

        connect
    } = useApp();

    return (
        <Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="rounded-xl" disabled={isConnecting}>
                    Connect Wallet
                </Button>
            </DialogTrigger>

            <DialogContent className="flex max-w-md flex-col gap-0 overflow-hidden p-0 rounded-xl border-border/50 shadow-xl">
                <div className="flex w-full flex-col gap-4 p-6">
                    <DialogHeader className="text-center">
                        <DialogTitle className="text-xl font-bold">
                            Connect to xPump
                        </DialogTitle>
                        <DialogDescription className="text-sm">
                            Connect with one of the available wallet providers
                            or create a new wallet.
                        </DialogDescription>
                    </DialogHeader>

                    <WalletList
                        onSelect={connect}
                        isConnecting={isConnecting}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}