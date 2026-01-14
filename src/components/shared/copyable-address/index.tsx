"use client"

import { FC } from "react"
import { Check, Copy } from "lucide-react"

import { cn } from "@/utils"
import { formatAddress } from "@mysten/sui/utils"
import { useResolveSuiNSName } from "@mysten/dapp-kit"
import { useClipboard } from "@/hooks/use-clipboard"
import { getWalletLabel } from "@/constants/wallet-labels"
import { CopyableAddressProps } from "./copyable-address.types"


const CopyableAddress: FC<CopyableAddressProps> = ({ address, showFull = false, showLabel = true, className }) => {
    const { copy, copied } = useClipboard()
    const label = showLabel ? getWalletLabel(address) : undefined
    // const { data: suins } = useResolveSuiNSName(label ? undefined : address)

    // priority: label, suins, formatted address
    const displayName = label || (showFull ? address : formatAddress(address))

    return (
        <div
            className={cn(
                "flex items-center gap-1 transition-all duration-300",
                "text-muted-foreground hover:text-foreground",
                "select-none",
                className
            )}
            onClick={() => copy(address)}
        >
            <span className={cn(
                "text-xs font-mono",
                label && "uppercase",
                "hover:cursor-default"
            )}>
                {displayName}
            </span>

            {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
        </div>
    )
}

export default CopyableAddress;