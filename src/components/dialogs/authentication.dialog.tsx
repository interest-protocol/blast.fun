"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { WalletList } from "../shared/wallet-list";
import { useApp } from "@/context/app.context";
import { Loader2 } from "lucide-react";

const AuthenticationDialog = () => {
    const {
        isConnectDialogOpen,
        setIsConnectDialogOpen,
        isConnecting,
        connect,
    } = useApp();

    return (
        <Dialog
            open={isConnectDialogOpen}
            onOpenChange={(open) => {
                if (!isConnecting) {
                    setIsConnectDialogOpen(open);
                }
            }}
        >
            <DialogContent
                className="flex max-w-sm flex-col gap-0 overflow-hidden p-0 rounded-2xl border-border/50 shadow-xl"
                showCloseButton={!isConnecting}
                onPointerDownOutside={(e) => {
                    if (isConnecting) {
                        e.preventDefault();
                    }
                }}
                onEscapeKeyDown={(e) => {
                    if (isConnecting) {
                        e.preventDefault();
                    }
                }}
            >
                <div className="flex w-full flex-col gap-4 p-4">
                    {isConnecting ? (
                        <div className="flex flex-col items-center justify-center py-4 gap-4">
                            <div className="relative">
                                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <p className="text-base font-medium">Connecting to wallet</p>
                                <p className="text-sm text-muted-foreground">Please approve the connection in your wallet</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <DialogHeader className="text-center">
                                <DialogTitle className="text-xl font-bold">Connect to BLAST.FUN</DialogTitle>
                                <DialogDescription className="text-sm">
                                    Connect with one of the available wallet providers.
                                </DialogDescription>
                            </DialogHeader>

                            <WalletList onSelect={connect} isConnecting={isConnecting} />
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default AuthenticationDialog;
