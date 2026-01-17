"use client"

import { FC } from "react"
import { Loader2, AlertCircle } from "lucide-react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { RecipientsPreviewProps } from "./recipients-preview.types"

const RecipientsPreview: FC<RecipientsPreviewProps> = (
    {
        recipients,
        isResolving,
        totalAmount
    }
) => {
    return (
        <div className="border-2 shadow-lg rounded-xl lg:flex lg:flex-col lg:min-h-0 lg:overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between lg:flex-shrink-0">
                <h3 className="font-mono text-lg uppercase tracking-wider text-foreground/80">RECIPIENTS PREVIEW</h3>
                {isResolving && (
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-xs font-mono uppercase">Resolving...</span>
                    </div>
                )}
            </div>

            <ScrollArea className="lg:flex-1 lg:overflow-hidden">
                <table className="w-full">
                    <thead className="bg-background/30 border-b-2 border-border sticky top-0 z-20">
                        <tr>
                            <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-muted-foreground">INPUT</th>
                            <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-muted-foreground">ADDRESS</th>
                            <th className="px-4 py-3 text-right font-mono text-xs uppercase tracking-wider text-muted-foreground">AMOUNT</th>
                        </tr>
                    </thead>

                    <tbody>
                        {recipients.map((recipient, index) => (
                            <tr key={index} className="border-t hover:bg-muted/20 transition-colors">
                                <td className="px-4 py-3 text-sm font-mono">
                                    {recipient.originalInput && recipient.originalInput !== recipient.address ? (
                                        <span className="text-muted-foreground">
                                            {recipient.originalInput.length > 20 ? `${recipient.originalInput.slice(0, 20)}...` : recipient.originalInput}
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground/40">-</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-sm font-mono">
                                    {recipient.isResolving ? (
                                        <span className="flex items-center gap-2 text-muted-foreground">
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                            Resolving...
                                        </span>
                                    ) : recipient.resolutionError ? (
                                        <span className="flex items-center gap-2 text-destructive">
                                            <AlertCircle className="h-3 w-3" />
                                            {recipient.resolutionError}
                                        </span>
                                    ) : recipient.address ? (
                                        <a
                                            href={`https://suivision.xyz/account/${recipient.address}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline"
                                        >
                                            {`${recipient.address.slice(0, 6)}...${recipient.address.slice(-4)}`}
                                        </a>
                                    ) : (
                                        <span className="text-muted-foreground/40">-</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-sm text-right font-mono font-semibold">{recipient.amount}</td>
                            </tr>
                        ))}
                    </tbody>

                    <tfoot className="bg-background/30 border-t-2 border-border sticky bottom-0 z-20">
                        <tr>
                            <td colSpan={2} className="px-4 py-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">TOTAL</td>
                            <td className="px-4 py-3 font-mono text-sm uppercase text-right font-bold text-foreground/80">
                                {totalAmount.toFixed(2)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </ScrollArea>
        </div>
    )
}

export default RecipientsPreview
