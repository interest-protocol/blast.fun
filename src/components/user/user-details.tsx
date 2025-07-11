"use client";

import { useWallet } from "@/context/wallet.context";
import { formatAddress } from "@mysten/sui/utils";
import { CopyableAddress } from "../shared/copyable-address";

export function UserDetails() {
    const { address, domain } = useWallet();

    if (!address) return null;

    return (
        <>
            {/* todo */}
            {/* <TwitterUserAvatar className="h-10 w-10" />  */}

            <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">
                        {domain || formatAddress(address || "")}
                    </span>
                </div>
                <CopyableAddress address={address} />
            </div>
        </>
    );
}