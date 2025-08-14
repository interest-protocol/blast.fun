"use client"

import Balance from "@/components/balance"
import { UserDropdown } from "@/components/user/user-dropdown"
import { useApp } from "@/context/app.context"
import { Logo } from "@/components/ui/logo"

export function EmbedHeader() {
	const { isConnected } = useApp()

	return (
		<header className="border-b border-border bg-background">
			<div className="flex items-center justify-between px-3 py-2.5">
				<div className="flex items-center gap-2.5">
					<Logo className="h-6 w-6 text-destructive" />
					<span className="font-black text-sm text-foreground">
						BLAST.FUN
					</span>
				</div>

				<div className="flex items-center gap-2">
					<UserDropdown />
				</div>
			</div>
		</header>
	)
}