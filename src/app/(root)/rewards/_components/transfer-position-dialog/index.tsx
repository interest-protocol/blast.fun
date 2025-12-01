"use client"

import { FC } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle } from "lucide-react"
import { TransferPositionDialogProps } from "./transfer-position-dialog.types"
import { useTransferPosition } from "./_hooks/use-transfer-position"

const TransferPositionDialog: FC<TransferPositionDialogProps> = ({
    open,
    onOpenChange,
    tokenSymbol,
    onConfirm
}) => {

    const {
        recipientAddress,
        setRecipientAddress,
        isTransferring,
        error,
        setError,
        handleTransfer,
        handleClose
    } = useTransferPosition(onConfirm, onOpenChange)

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Transferring ${tokenSymbol || "Position"}</DialogTitle>
                    <DialogDescription>
                        Transfer ownership to another wallet address, this cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-3">
                    <div className="space-y-1.5">
                        <Label htmlFor="recipient" className="text-muted-foreground text-sm">
                            Recipient Address
                        </Label>

                        <Input
                            id="recipient"
                            placeholder="0x..."
                            value={recipientAddress}
                            onChange={(e) => {
                                setRecipientAddress(e.target.value)
                                setError("")
                            }}
                            disabled={isTransferring}
                            className="font-mono text-sm"
                        />

                        {error && (
                            <div className="flex items-center gap-1.5 text-xs text-destructive">
                                <AlertCircle className="size-3.5" />
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isTransferring}
                        size="sm"
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleTransfer}
                        disabled={isTransferring || !recipientAddress.trim()}
                        size="sm"
                    >
                        {isTransferring ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Transferring...
                            </>
                        ) : (
                            "Transfer"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default TransferPositionDialog
