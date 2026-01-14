"use client"

import { FC } from "react"
import { Check, Copy } from "lucide-react"

import { cn } from "@/utils"
import { useClipboard } from "@/hooks/use-clipboard"
import { CopyableTokenProps } from "./copyable-token.types"

const CopyableToken: FC<CopyableTokenProps> = ({ symbol, coinType, className }) => {
    const { copy, copied } = useClipboard();

    return (
        <div
            className={cn(
                "flex items-center gap-1 transition-all duration-300",
                "text-muted-foreground hover:text-foreground",
                className
            )}
            onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                copy(coinType)
            }}
        >
            <span className="font-mono text-xs uppercase">{symbol}</span>

            {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
        </div>
    );
}

export default CopyableToken;
