"use client"

import { formatAddress } from "@mysten/sui/utils"
import { useResolveSuiNSName } from "@mysten/dapp-kit"
import { Wallet, Check, Copy, CheckCircle2, Unplug } from "lucide-react"
import { useApp } from "@/context/app.context"
import { useClipboard } from "@/hooks/use-clipboard"
import { Button } from "../ui/button"
import { cn } from "@/utils"

interface WalletAccountItemProps {
    account: any
    isActive: boolean
    onSelect: () => void
}

function WalletAccountItem({ account, isActive, onSelect }: WalletAccountItemProps) {
    const { data: domain } = useResolveSuiNSName(account.address)
    const { copy, copied } = useClipboard()

    const displayAddress = domain || formatAddress(account.address)

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation()
        copy(account.address)
    }

    return (
        <Button
            variant="ghost"
            onClick={onSelect}
            className={cn(
                "w-full justify-start h-auto py-2",
                isActive && "bg-background/60"
            )}
        >
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                    <Wallet className="size-4 text-muted-foreground" />
                    <span className="text-sm font-normal">
                        {displayAddress}
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleCopy}
                        className="size-5"
                    >
                        {copied ? (
                            <CheckCircle2 className="size-4 text-muted-foreground" />
                        ) : (
                            <Copy className="size-4 text-muted-foreground" />
                        )}
                    </Button>

                    {isActive && (
                        <Check className="size-4 text-green-400" />
                    )}
                </div>
            </div>
        </Button>
    )
}

export function MultiWallet() {
    const { accounts, wallet, switchAccount, disconnect } = useApp()

    if (accounts.length === 0) {
        return (
            <div className="text-center py-4 text-muted-foreground text-sm">
                No wallets connected
            </div>
        )
    }

    return (
        <div className="w-full">
            <div className="p-2 select-none">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Accounts
                </h3>
            </div>

            <div className="space-y-1 max-h-[300px] overflow-y-auto p-1">
                {accounts.map((account) => (
                    <WalletAccountItem
                        key={account.address}
                        account={account}
                        isActive={account.address === wallet?.address}
                        onSelect={() => {
                            if (account.address !== wallet?.address) {
                                switchAccount(account)
                            }
                        }}
                    />
                ))}

                <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:bg-destructive/10 bg-transparent"
                    onClick={disconnect}
                >
                    <span className="flex flex-grow items-center gap-2 text-destructive">
                        <Unplug className="size-4" />
                        {accounts.length > 1 ? "Disconnect All" : "Disconnect Wallet"}
                    </span>
                </Button>
            </div>
        </div>
    )
}