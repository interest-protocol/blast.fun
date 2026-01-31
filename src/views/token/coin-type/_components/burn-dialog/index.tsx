import { FC } from "react";
import { Flame, Loader2, CheckCircle } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatNumberWithSuffix } from "@/utils/format"

import { BurnDialogProps } from "./burn-dialog.types"
import { useBurnLogic } from "./_hooks/use-burn-logic"

const BurnDialog: FC<BurnDialogProps> = (props) => {
    const {
        amount,
        setAmount,
        isProcessing,
        error,
        success,
        symbol,
        balanceInDisplayUnit,
        balanceInDisplayUnitPrecise,
        handleQuickAmount,
        handleBurn,
        handleOpenChange,
        metadata,
    } = useBurnLogic(props)

    return (
        <Dialog open={props.open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Flame className="h-5 w-5 text-orange-500" />
                        Burn {symbol}
                    </DialogTitle>
                    <DialogDescription>
                        Permanently burn supply for this token, this action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Balance Display */}
                    <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Your Balance</span>
                            <span className="font-mono">
                                {formatNumberWithSuffix(balanceInDisplayUnit)} {symbol}
                            </span>
                        </div>
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Amount to Burn</label>
                            <button
                                onClick={() => setAmount(balanceInDisplayUnitPrecise)}
                                className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                                disabled={isProcessing}
                            >
                                MAX
                            </button>
                        </div>
                        <Input
                            type="text"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            disabled={isProcessing}
                            className="font-mono"
                        />
                    </div>

                    {/* Quick Percentage Buttons */}
                    <div className="grid grid-cols-4 gap-2">
                        {[25, 50, 75, 100].map((percentage) => (
                            <Button
                                key={percentage}
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickAmount(percentage)}
                                disabled={isProcessing || balanceInDisplayUnit === 0}
                                className="font-mono text-xs"
                            >
                                {percentage}%
                            </Button>
                        ))}
                    </div>

                    {/* Success */}
                    {success && (
                        <Alert className="border-green-500/50 bg-green-500/10">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <AlertDescription className="text-xs text-green-500">
                                {success}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Warning */}
                    {!success && (
                        <Alert className="border-orange-500/50 bg-orange-500/10">
                            <Flame className="h-4 w-4 text-orange-500" />
                            <AlertDescription className="text-xs">
                                Burning tokens permanently removes them from circulation.
                                This will reduce the total supply and cannot be reversed.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Error */}
                    {error && (
                        <Alert className="border-destructive/50 bg-destructive/10">
                            <AlertDescription className="text-xs text-destructive">
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={isProcessing}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleBurn}
                            disabled={isProcessing || !amount || parseFloat(amount) <= 0}
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Burning...
                                </>
                            ) : (
                                <>
                                    <Flame className="h-4 w-4 mr-2" />
                                    Burn Tokens
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default BurnDialog;