"use client"

import Balance from "@/components/balance"
import { UserDropdown } from "@/components/user/user-dropdown"
import { useApp } from "@/context/app.context"
import { Logo } from "@/components/ui/logo"

export function EmbedHeader() {
	const { isConnected } = useApp()

	return (
		<header className="border-b backdrop-blur-sm">
			<div className="flex items-center justify-between px-4 py-3">
				<div className="flex items-center gap-2 select-none">
					<Logo className="h-6 w-6 text-muted-foreground group-hover:text-muted-foreground/80 transition-colors duration-300" />
					<span className="font-mono font-bold text-xl uppercase tracking-wider">
						X::PUMP
					</span>
				</div>

				<div className="flex items-center justify-end gap-3">
					{isConnected && (
						<>
							<Balance />
							<div className="h-6 w-[1px] bg-foreground/20" />
						</>
					)}

					<UserDropdown />
				</div>
			</div>
		</header>
	)
}