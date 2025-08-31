"use client"

import Header from "@/components/layout/header"
import { MobileNavigation } from "@/components/layout/mobile-nav"
import { TokenTabsHeader } from "@/components/layout/token-tabs-header"
import { usePathname } from "next/navigation"
import { useBreakpoint } from "@/hooks/use-breakpoint"
import { cn } from "@/utils"

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const pathname = usePathname()
	const { isMobile, width } = useBreakpoint()

	const isTokenPage = pathname.startsWith('/token/')
	const isStreamPage = pathname.startsWith('/stream/room/')
	const isHomePage = pathname === "/"

	// during initial load (width === 0), default to desktop behavior for padding
	const shouldHavePadding = !isTokenPage && !isStreamPage && !(width > 0 && isMobile && isHomePage)

	return (
		<div className="flex flex-col h-screen overflow-hidden">
			{/* <Ticker /> */}
			<Header />
			<TokenTabsHeader />

			<main className="flex-1 overflow-hidden">
				{shouldHavePadding ? (
					<div className={cn(
						"h-full overflow-auto p-2"
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
