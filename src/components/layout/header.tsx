"use client"

import Link from "next/link"
import { useApp } from "@/context/app.context"
import Balance from "../balance"
import { ThemeSwitcher } from "../shared/theme-switcher"
import { UserDropdown } from "../user/user-dropdown"
import { DesktopNav } from "./desktop-nav"
import { SearchToken } from "../shared/search-token"
import { Logo } from "../ui/logo"
import { AudioToggle } from "../audio/audio-toggle"

export default function Header() {
	const { isConnected } = useApp()

	return (
		<header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50">
			<div className="h-16 px-4 xl:px-8 flex items-center justify-between">
				{/* Logo and Navigation */}
				<div className="flex items-center gap-8 xl:gap-12">
					<Link href="/" className="group flex items-center gap-2.5">
						<Logo className="h-8 w-8 text-destructive group-hover:text-destructive/80 transition-colors" />
						<span className="hidden sm:inline-block font-black text-lg text-foreground group-hover:text-destructive transition-colors">
							BLAST.FUN
						</span>
					</Link>

					<DesktopNav />
				</div>

				{/* Actions */}
				<div className="flex items-center gap-3">
					<SearchToken />

					{isConnected && (
						<Balance className="hidden lg:block" />
					)}

					<UserDropdown />

					<div className="flex items-center gap-2 pl-3 border-l border-border/50">
						<AudioToggle />
						<ThemeSwitcher />
					</div>
				</div>
			</div>
		</header>
	)
}
