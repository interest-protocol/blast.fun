import Header from "@/components/layout/header"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Ticker } from "@/components/shared/ticker"

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<div className="flex flex-col h-screen overflow-hidden">
			<Ticker />
			<Header />

			<main className="flex-1 overflow-y-auto pb-14 md:pb-0">
				<div className="p-6">{children}</div>
			</main>

			<MobileNav />
		</div>
	)
}
