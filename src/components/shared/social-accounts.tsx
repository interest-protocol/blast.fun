"use client"

import { LogOut } from "lucide-react"
import { BsTwitterX } from "react-icons/bs"
import { useTwitter } from "@/context/twitter.context"
import { Button } from "../ui/button"
import { TwitterUserAvatar } from "../user/user-avatar"

export function SocialAccounts() {
	const { user, isLoggedIn, login, logout } = useTwitter()

	if (!isLoggedIn || !user) {
		return (
			<Button
				variant="outline"
				className="w-full justify-start"
				onClick={login}
			>
				<BsTwitterX className="w-4 h-4 mr-2" />
				Connect X/Twitter
			</Button>
		)
	}

	return (
		<div className="flex items-center gap-2 flex-1 w-full">
			<TwitterUserAvatar user={user} className="h-10 w-10" />

			<div className="flex flex-col flex-1 min-w-0">
				<div className="flex items-center gap-2">
					<span className="font-semibold text-sm">
						{user.name || user.username}
					</span>
				</div>
				<span className="text-xs text-muted-foreground">
					@{user.username}
				</span>
			</div>

			<Button
				variant="ghost"
				size="icon"
				onClick={logout}
				className="hover:bg-card/50"
			>
				<LogOut className="w-4 h-4" />
			</Button>
		</div>
	)
}
