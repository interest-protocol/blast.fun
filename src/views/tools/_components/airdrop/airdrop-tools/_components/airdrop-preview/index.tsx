"use client"

import { FC } from "react"
import { Loader2, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { AirdropPreviewProps } from "./airdrop-preview.types"

const AirdropPreview: FC<AirdropPreviewProps> = ({
    selectedCoinInfo,
    recipients,
    totalAmount,
    isRecoveringGas,
    isAirdropComplete,
    lastCsvInput,
    csvInput,
    delegatorAddress,
    airdropProgress,
    isProcessing,
    handleAirdrop,
}) => {
    return (
        <div className="border-2 shadow-lg rounded-xl lg:flex-shrink-0">
            <div className="p-4 border-b">
                <h3 className="text-lg font-mono uppercase tracking-wider text-foreground/80">AIRDROP PREVIEW</h3>
            </div>

            <div className="p-4 space-y-4">
                {selectedCoinInfo && recipients.length > 0 ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">RECIPIENTS</p>
                                <p className="font-mono text-2xl font-bold text-foreground/80">{recipients.length}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">TOTAL AMOUNT</p>
                                <p className="font-mono text-2xl font-bold text-foreground/80">
                                    {totalAmount.toFixed(2)}
                                </p>
                                <p className="font-mono text-xs uppercase text-muted-foreground/60">
                                    {selectedCoinInfo.symbol}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">SERVICE FEE</p>
                                <p className="font-mono text-2xl font-bold text-foreground/80">
                                    {(recipients.length * 0.01).toFixed(2)}
                                </p>
                                <p className="font-mono text-xs uppercase text-muted-foreground/60">SUI</p>
                            </div>

                            <div className="space-y-1">
                                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">STATUS</p>
                                {recipients.some((r) => r.resolutionError) ? (
                                    <>
                                        <p className="font-mono text-2xl font-bold text-destructive">
                                            {recipients.filter((r) => r.resolutionError).length} ERRORS
                                        </p>
                                        <p className="font-mono text-xs uppercase text-destructive/60">CHECK ADDRESSES</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="font-mono text-2xl font-bold text-green-500">READY</p>
                                        <p className="font-mono text-xs uppercase text-green-500/60">ALL VALID</p>
                                    </>
                                )}
                            </div>
                        </div>

                        {isAirdropComplete && delegatorAddress && csvInput === lastCsvInput && (
                            <div className="text-center pt-4 border-t">
                                <a
                                    href={`https://suivision.xyz/account/${delegatorAddress}?tab=Activity`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono text-xs text-primary hover:underline uppercase"
                                >
                                    VIEW TRANSACTIONS
                                </a>
                            </div>
                        )}

                        <Button
                            onClick={handleAirdrop}
                            disabled={!selectedCoinInfo || recipients.length === 0 || recipients.some((r) => r.resolutionError) || isProcessing}
                            className="w-full font-mono uppercase tracking-wider py-6 text-sm"
                            size="lg"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {airdropProgress || "Processing..."}
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    {isRecoveringGas
                                        ? "RESUME GAS RECOVERY"
                                        : isAirdropComplete && csvInput === lastCsvInput
                                            ? "EXECUTE AIRDROP AGAIN"
                                            : "EXECUTE AIRDROP"}
                                </>
                            )}
                        </Button>

                        {recipients.some((r) => r.resolutionError) && (
                            <p className="font-mono text-xs uppercase text-destructive text-center">
                                FIX ADDRESS ERRORS BEFORE PROCEEDING
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="w-12 h-12 mx-auto mb-4 animate-bounce bg-muted rounded-full" />
                        <p className="font-mono text-sm uppercase text-muted-foreground">AWAITING::INPUT</p>
                        <p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">SELECT_COIN_AND_ADD_RECIPIENTS</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AirdropPreview
