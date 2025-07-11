"use client";

import { Copy, Check } from "lucide-react";
import { Button } from "../ui/button";
import { formatAddress } from "@mysten/sui/utils";
import { cn } from "@/utils";
import { useClipboard } from "@/hooks/use-clipboard";

interface CopyableAddressProps {
    address: string;
    showFull?: boolean;
    className?: string;
}

export function CopyableAddress({
    address,
    showFull = false,
    className
}: CopyableAddressProps) {
    const { copy, copied } = useClipboard();

    const displayAddress = showFull ? address : formatAddress(address);

    return (
        <div className={cn(
            "flex items-center gap-1 transition-all duration-300",
            "text-muted-foreground hover:text-foreground",
            className)}
            onClick={() => copy(address)}
        >
            <span className="text-xs font-mono hover:cursor-default">
                {displayAddress}
            </span>

            {copied ? (
                <Check className="h-3 w-3 text-green-500" />
            ) : (
                <Copy className="h-3 w-3" />
            )}
        </div>
    );
}