"use client"

import Header from "@/components/layout/header"
import { MobileNavigation } from "@/components/layout/mobile-nav"
import { TokenTabsHeader } from "@/components/layout/token-tabs-header"
import { PreLaunchBanner } from "@/components/layout/pre-launch-banner"
import { Ticker } from "@/components/shared/ticker"
import { usePathname } from "next/navigation"
import { useBreakpoint } from "@/hooks/use-breakpoint"
import { cn } from "@/utils"

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const pathname = usePathname()
	const { isMobile } = useBreakpoint()

	const isTokenPage = pathname.startsWith("/meme/")
	const isHomePage = pathname === "/"

	const shouldHavePadding = !isTokenPage && !(isMobile && isHomePage)

	return (
		<div className="flex flex-col h-screen overflow-hidden">
			<PreLaunchBanner />
			<Ticker />
			<Header />
			<TokenTabsHeader />

			<main className="flex-1 overflow-hidden pb-16 lg:pb-0">
				{shouldHavePadding ? (
					<div className={cn(
						"h-full overflow-auto",
						isMobile ? "p-3" : "p-3 sm:p-4 md:p-6"
					)}>
						{children}
					</div>
				) : (
					children
				)}
			</main>

			<MobileNavigation />
		</div>
	)
}
