"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useWallet } from "@/context/wallet.context";
import { Button } from "../ui/button";
import { formatAddress } from "@mysten/sui/utils";
import { AuthenticationDialog } from "../dialogs/AuthenticationDialog";
import { UserDetails } from "./user-details";
import { LogOut } from "lucide-react";

export function UserDropdown() {
    const [open, setOpen] = useState(false);
    const { isConnected, address, domain, disconnect } = useWallet();

    return (
        <Popover
            open={isConnected && open}
            onOpenChange={setOpen}
        >
            <PopoverTrigger asChild>
                {isConnected ? (
                    <Button
                        variant="outline"
                        className="rounded-xl ease-in-out duration-300 transition-all"
                    >
                        <span className="text-muted-foreground group-hover:text-primary transition-colors duration-300 font-semibold text-sm">
                            {domain || formatAddress(address || "")}
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
                        <Button variant="ghost" onClick={disconnect}>
                            <span className="flex flex-grow items-center gap-2 text-destructive">
                                <LogOut className="w-4 h-4" />
                                Log out
                            </span>
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}