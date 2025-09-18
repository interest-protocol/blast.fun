"use client"

import Link from "next/link"
import { Logo } from "../ui/logo"
import { UserDropdown } from "../user/user-dropdown"
import { TradeTicker } from "./trade-ticker"

export default function Header() {
	return (
		<header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50">
			<div className="h-16 px-4 xl:px-8 flex items-center gap-4">
				<Link href="/" className="group flex items-center gap-2">
					<Logo className="size-8 text-foreground group-hover:text-destructive transition-colors duration-200" />
					<span className="hidden sm:inline-block font-mono font-black text-lg text-foreground group-hover:text-destructive transition-colors duration-200">
						BLAST.FUN
					</span>
				</Link>

				<TradeTicker />

				<div className="flex-shrink-0">
					<UserDropdown />
				</div>
			</div>
		</header>
	)
}
