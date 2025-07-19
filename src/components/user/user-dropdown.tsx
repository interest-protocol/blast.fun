"use client"

import { formatAddress } from "@mysten/sui/utils"
import { LogOut, Twitter, Unplug } from "lucide-react"
import { useState } from "react"
import { useApp } from "@/context/app.context"
import { useTwitter } from "@/context/twitter.context"
import { AuthenticationDialog } from "../dialogs/AuthenticationDialog"
import { Button } from "../ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { TwitterUserAvatar } from "./user-avatar"
import { UserDetails } from "./user-details"

export function UserDropdown() {
	const [open, setOpen] = useState(false)

	const { user, isLoggedIn, login, logout } = useTwitter()
	const { isConnected, address, domain, disconnect } = useApp()

	return (
		<Popover open={open && (isConnected || isLoggedIn)} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				{isConnected || isLoggedIn ? (
					<Button variant="outline" className="rounded-xl px-2 ease-in-out duration-300 transition-all">
						{user && <TwitterUserAvatar user={user} className="h-4 w-4" />}
						<span className="text-muted-foreground group-hover:text-primary transition-colors duration-300 font-semibold text-sm">
							{user?.username ? `@${user.username}` : domain || formatAddress(address || "")}
						</span>
					</Button>
				) : (
					<AuthenticationDialog />
				)}
			</PopoverTrigger>

			<PopoverContent className="min-w-[280px] p-2" align="end">
				<div className="space-y-2">
					<div className="flex gap-2 pb-2 border-b">
						<UserDetails />
					</div>

					{/* Social Accounts */}
					<div className="flex flex-col gap-2">
						<span className="text-xs text-muted-foreground uppercase font-mono font-medium">
							Social Accounts
						</span>

						{isLoggedIn && user ? (
							<div className="flex items-center justify-between p-2 bg-muted rounded-md">
								<div className="flex items-center gap-2">
									<TwitterUserAvatar user={user} className="h-8 w-8" />
									<span className="text-sm font-semibold">@{user.username}</span>
								</div>
								<Button variant="outline" size="icon" onClick={logout}>
									<LogOut className="w-4 h-4" />
								</Button>
							</div>
						) : (
							<Button variant="outline" className="w-full justify-start" onClick={login}>
								<span className="flex flex-grow items-center gap-2">
									<Twitter className="w-4 h-4" />
									Connect X/Twitter
								</span>
							</Button>
						)}
					</div>

					<Button
						variant="outline"
						className="w-full justify-start text-destructive hover:bg-destructive/10 bg-transparent"
						onClick={disconnect}
					>
						<span className="flex flex-grow items-center gap-2 text-destructive">
							<Unplug className="w-4 h-4" />
							Disconnect Wallet
						</span>
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	)
}
