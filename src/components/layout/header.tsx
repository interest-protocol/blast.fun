"use client"

import Link from "next/link"
import { useApp } from "@/context/app.context"
import { AudioToggle } from "../audio/audio-toggle"
import { SearchToken } from "../shared/search-token"
import { ThemeSwitcher } from "../shared/theme-switcher"
import { Logo } from "../ui/logo"
import { UserDropdown } from "../user/user-dropdown"
import { DesktopNav } from "./desktop-nav"

export default function Header() {
	const { isConnected } = useApp()

	return (
		<header className="sticky top-0 z-50 border-border/50 border-b bg-background/95 backdrop-blur-xl">
			<div className="flex h-16 items-center justify-between px-4 xl:px-8">
				{/* Logo and Navigation */}
				<div className="flex items-center gap-8 xl:gap-12">
					<Link href="/" className="group flex items-center gap-2.5">
						<Logo className="h-8 w-8 text-destructive transition-colors group-hover:text-destructive/80" />
						<span className="hidden font-black text-foreground text-lg transition-colors group-hover:text-destructive sm:inline-block">
							BLAST.FUN
						</span>
					</Link>

					<DesktopNav />
				</div>

				{/* Actions */}
				<div className="flex items-center gap-2">
					<SearchToken />
					<UserDropdown />
					<AudioToggle />
					<ThemeSwitcher />
				</div>
			</div>
		</header>
	)
}
