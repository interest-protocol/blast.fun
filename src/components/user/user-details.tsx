"use client";

import { useWallet } from "@/context/wallet.context";
import { formatAddress } from "@mysten/sui/utils";
import { CopyableAddress } from "../shared/copyable-address";
import { useTwitter } from "@/context/twitter.context";
import { TwitterUserAvatar } from "./user-avatar";

export function UserDetails() {
    const { user, isLoggedIn } = useTwitter();
    const { isConnected, address, domain } = useWallet();

    if (!isConnected || !address) return null;

    return (
        <>
            {/* <TwitterUserAvatar user={user} className="h-10 w-10" /> */}

            <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">
                        {user?.username || domain || formatAddress(address || "")}
                    </span>
                </div>
                <CopyableAddress address={address} />
            </div>
        </>
    );
}