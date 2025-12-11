"use client"

import { FC } from "react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { QuickActionsProps } from "./quick-actions.types"

const QuickActions: FC<QuickActionsProps> = ({
    tradeType,
    isProcessing,
    hasBalance,
    handleQuickAmount
}) => (
    <div className="space-y-1">
        {tradeType === "buy" ? (
            <div className="grid grid-cols-4 gap-1">
                {[1, 5, 10, 50].map((suiAmount) => (
                    <Button
                        key={suiAmount}
                        variant="outline"
                        size="sm"
                        className="font-mono text-[10px] h-6 p-0.5 !border-blue-400/50 !bg-blue-400/10 text-blue-400 hover:text-blue-400/80"
                        onClick={() => handleQuickAmount(suiAmount)}
                        disabled={isProcessing}
                    >
                        <Image
                            src="/logo/sui-logo.svg"
                            alt="SUI"
                            width={10}
                            height={10}
                            className="mr-0.5"
                        />
                        {suiAmount}
                    </Button>
                ))}
            </div>
        ) : (
            <div className="grid grid-cols-4 gap-1">
                {[25, 50, 75, 100].map((percentage) => (
                    <Button
                        key={percentage}
                        variant="outline"
                        size="sm"
                        className="font-mono text-xs h-7"
                        onClick={() => handleQuickAmount(percentage)}
                        disabled={isProcessing || !hasBalance}
                    >
                        {percentage}%
                    </Button>
                ))}
            </div>
        )}
    </div>
)

export default QuickActions
