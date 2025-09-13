"use client"

import { useEffect, useState } from "react"
import { useSearchParams, usePathname } from "next/navigation"
import { NewlyCreated } from "@/components/tokens/newly-created"
import { NearGraduation } from "@/components/tokens/near-graduation"
import { GraduatedComplete } from "@/components/tokens/graduated-complete"
import { MobileTokenList } from "@/components/tokens/mobile-token-list"
import { QuickAccountDialog } from "@/components/dialogs/QuickAccountDialog"
import { useBreakpoint } from "@/hooks/use-breakpoint"

export default function DiscoveryPageContent() {
	const { isMobile } = useBreakpoint()
	const searchParams = useSearchParams()
	const pathname = usePathname()
	const [showQuickWallet, setShowQuickWallet] = useState(false)

	useEffect(() => {
		// @dev: Only show Quick Account dialog if we're on home page with the query param
		if (pathname === "/" && searchParams.get("quick_wallet_signin") === "true") {
			setShowQuickWallet(true)
		}
	}, [searchParams, pathname])

	const handleQuickWalletClose = (open: boolean) => {
		setShowQuickWallet(open)
		// @dev: Clean up URL when dialog closes
		if (!open && searchParams.get("quick_wallet_signin") === "true") {
			const url = new URL(window.location.href)
			url.searchParams.delete("quick_wallet_signin")
			window.history.replaceState({}, "", url.pathname)
		}
	}

	if (isMobile) {
		return (
			<>
				<div className="h-full">
					<MobileTokenList />
				</div>
				<QuickAccountDialog 
					open={showQuickWallet} 
					onOpenChange={handleQuickWalletClose}
				/>
			</>
		)
	}

	return (
		<>
			<div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-4">
				<NewlyCreated pollInterval={10000} />
				<NearGraduation pollInterval={10000} />
				<GraduatedComplete pollInterval={30000} />
			</div>
			<QuickAccountDialog 
				open={showQuickWallet} 
				onOpenChange={handleQuickWalletClose}
			/>
		</>
	)
}