"use client"

import { formatAddress } from "@mysten/sui/utils"
import { Unplug, Wallet } from "lucide-react"
import { useState } from "react"
import { useApp } from "@/context/app.context"
import MultiWallet from "../shared/multi-wallet"
import { useTwitter } from "@/context/twitter.context"
import { Button } from "../ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { TwitterUserAvatar } from "./user-avatar"
import { SocialAccounts } from "../shared/social-accounts"
import { AuthenticationDialog } from "../dialogs/authentication.dialog"

export function UserDropdown() {
	const [open, setOpen] = useState(false)

	const { user, isLoggedIn } = useTwitter()
	const { isConnected, address, domain, disconnect, setIsConnectDialogOpen, accounts } = useApp()

	const showConnectButton = !isConnected && !isLoggedIn
	const showPopover = isLoggedIn || isConnected

	return (
		<>
			<AuthenticationDialog />

			{showConnectButton && (
				<Button variant="outline" className="text-muted-foreground w-full" onClick={() => setIsConnectDialogOpen(true)}>
					Connect Wallet
				</Button>
			)}

			{showPopover && (
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button variant="outline" className="rounded-lg group px-2 ease-in-out duration-300 transition-all">
							{user && <TwitterUserAvatar user={user} className="h-4 w-4" />}
							<span className="text-muted-foreground group-hover:text-primary transition-colors duration-300 font-semibold text-sm">
								{user?.username ? `@${user.username}` : domain || formatAddress(address || "")}
							</span>
						</Button>
					</PopoverTrigger>

					<PopoverContent className="max-w-sm p-0 bg-background/60 backdrop-blur-3xl rounded-lg shadow-2xl border" align="end">
						<div className="space-y-2">
							<div className="flex items-center gap-2 p-2 pb-2 border-b">
								<SocialAccounts />
							</div>

							{isConnected ? (
								<MultiWallet />
							) : (
								<div className="p-2 pt-0">
									<Button
										variant="outline"
										className="w-full"
										onClick={() => {
											setOpen(false)
											setIsConnectDialogOpen(true)
										}}
									>
										<Wallet className="w-4 h-4 mr-2" />
										Connect Wallet
									</Button>
								</div>
							)}
						</div>
					</PopoverContent>
				</Popover>
			)}
		</>
	)
}
