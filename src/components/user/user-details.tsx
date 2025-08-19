"use client"

import { formatAddress } from "@mysten/sui/utils"
import { useApp } from "@/context/app.context"
import { useTwitter } from "@/context/twitter.context"
import { CopyableAddress } from "../shared/copyable-address"
import { TwitterUserAvatar } from "./user-avatar"

export function UserDetails() {
	const { user } = useTwitter()
	const { isConnected, address, domain, currentAccount, currentWalletName } = useApp()

	if (!isConnected || !address) return null

	return (
		<>
			{user && <TwitterUserAvatar user={user} className="h-10 w-10" />}

			<div className="flex flex-col flex-1 min-w-0">
				<div className="flex items-center gap-2">
					<span className="font-semibold text-sm">
						{user?.username ? `@${user.username}` : currentAccount?.label || domain || formatAddress(address || "")}
					</span>
				</div>
				<CopyableAddress address={address} />
			</div>
		</>
	)
}
