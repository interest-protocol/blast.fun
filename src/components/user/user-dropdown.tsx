"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useWallet } from "@/context/wallet.context";
import { Button } from "../ui/button";
import { formatAddress } from "@mysten/sui/utils";
import { AuthenticationDialog } from "../dialogs/AuthenticationDialog";
import { UserDetails } from "./user-details";
import { LogOut, RefreshCw } from "lucide-react";
import { useTwitter } from "@/context/twitter.context";

export function UserDropdown() {
    const [open, setOpen] = useState(false);

    const { user, isLoggedIn, isLoading, login, logout } = useTwitter();
    const { isConnected, address, domain, disconnect } = useWallet();

    return (
        <Popover
            open={open && (isConnected || isLoggedIn)}
            onOpenChange={setOpen}
        >
            <PopoverTrigger asChild>
                {isConnected || isLoggedIn ? (
                    <Button
                        variant="outline"
                        className="rounded-xl ease-in-out duration-300 transition-all"
                    >
                        <span className="text-muted-foreground group-hover:text-primary transition-colors duration-300 font-semibold text-sm">
                            {user?.username || domain || formatAddress(address || '')}
                        </span>
                    </Button>
                ) : (
                    <AuthenticationDialog />
                )}
            </PopoverTrigger>

            <PopoverContent className="min-w-[320px] p-0" align="end">
                <div className="flex flex-col space-y-2 p-2">
                    <div className="flex items-center gap-2 pb-2 border-b">
                        <UserDetails />
                    </div>

                    {/* Actions */}
                    {/* @todo: in future, we can properly register an array const and do iterable rendering for each item. -matical */}
                    <div className="flex flex-col gap-2">
                        {/* connect twitter button */}

                        <Button variant="ghost" onClick={disconnect}>
                            <span className="flex flex-grow items-center gap-2 text-destructive">
                                <LogOut className="w-4 h-4" />
                                Disconnect Wallet
                            </span>
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}