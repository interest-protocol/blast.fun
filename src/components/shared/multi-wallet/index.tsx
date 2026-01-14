"use client"

import { FC } from "react"
import { Unplug } from "lucide-react"

import { useApp } from "@/context/app.context"
import { Button } from "@/components/ui/button"
import WalletAccountItem from "./wallet-account-item"

const MultiWallet: FC = () => {
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
    );
}

export default MultiWallet;