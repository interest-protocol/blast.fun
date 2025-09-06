"use client"

import { Logo } from "@/components/ui/logo"
import { UserDropdown } from "@/components/user/user-dropdown"
import { useApp } from "@/context/app.context"

export function EmbedHeader() {
	const { isConnected } = useApp()

	return (
		<header className="border-border border-b bg-background">
			<div className="flex items-center justify-between px-3 py-2.5">
				<div className="flex items-center gap-2.5">
					<Logo className="h-6 w-6 text-destructive" />
					<span className="font-black text-foreground text-sm">BLAST.FUN</span>
				</div>

				<div className="flex items-center gap-2">
					<UserDropdown />
				</div>
			</div>
		</header>
	)
}
