"use client"

import { useWallets } from "@mysten/dapp-kit"
import type { WalletWithRequiredFeatures } from "@mysten/wallet-standard"
import { ChevronRight, Sparkles } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { useMounted } from "@/hooks/use-mounted"
import { Button } from "../ui/button"
import { Skeleton } from "../ui/skeleton"
import { usePrivyAuth } from "@/hooks/privy/use-privy-auth"
import { Separator } from "../ui/separator"
import { SUI_WALLETS, type SuiWallet } from "@/constants/sui-wallets"

type WalletListWithPrivyProps = {
	onSelect: (wallet: WalletWithRequiredFeatures) => Promise<void>
	isConnecting?: boolean
	onClose?: () => void
}

export function WalletListWithPrivy({ onSelect, isConnecting = false, onClose }: WalletListWithPrivyProps) {
	const wallets = useWallets()
	const isMounted = useMounted()
	const router = useRouter()
	const { isAuthenticated } = usePrivyAuth()
	const [viewMore, setViewMore] = useState(false)

	const enrichedWallets = useMemo(() => {
		return SUI_WALLETS.map((configWallet) => {
			const detectedWallet = wallets.find((w) => w.name === configWallet.name)
			return {
				...configWallet,
				isInstalled: !!detectedWallet,
				wallet: detectedWallet,
			}
		})
	}, [wallets])

	const sortedWallets = useMemo(() => {
		return [...enrichedWallets].sort((a, b) => {
			if (a.isInstalled && !b.isInstalled) return -1
			if (!a.isInstalled && b.isInstalled) return 1

			const orderMap: Record<string, number> = {
				Slush: 1,
				"OKX Wallet": 2,
				Phantom: 3,
			}

			const aOrder = orderMap[a.name] || 999
			const bOrder = orderMap[b.name] || 999

			if (aOrder !== bOrder) {
				return aOrder - bOrder
			}

			return a.name.localeCompare(b.name)
		})
	}, [enrichedWallets])

	const getInstallLink = (wallet: SuiWallet) => {
		if (typeof window === "undefined") return wallet.link?.desktop

		const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
		const isAndroid = /Android/.test(navigator.userAgent)
		const isMobileDevice = isIOS || isAndroid

		if (!isMobileDevice && wallet.link?.desktop) {
			return wallet.link.desktop
		}
		if (isIOS && wallet.link?.mobile?.ios) {
			return wallet.link.mobile.ios
		}
		if (isAndroid && wallet.link?.mobile?.android) {
			return wallet.link.mobile.android
		}

		return wallet.link?.desktop
	}

	const handleQuickAccountClick = () => {
		router.push("/?quick_wallet_signin=true")
		if (onClose) {
			onClose()
		}
	}

	const handleWalletClick = (enriched: (typeof enrichedWallets)[0]) => {
		if (enriched.isInstalled && enriched.wallet) {
			onSelect(enriched.wallet)
		} else {
			const link = getInstallLink(enriched)
			if (link) {
				window.open(link, "_blank")
			}
		}
	}

	if (!isMounted) {
		return (
			<div className="flex flex-col gap-2">
				{Array.from({ length: 4 }).map((_, i) => (
					<div
						key={i}
						className="h-16 w-full rounded-lg border border-border p-5 flex items-center justify-between"
					>
						<div className="flex items-center gap-3">
							<Skeleton className="h-10 w-10 rounded-lg" />
							<Skeleton className="h-4 w-24" />
						</div>
					</div>
				))}
			</div>
		)
	}

	const displayedWallets = viewMore ? sortedWallets : sortedWallets.slice(0, 6)

	return (
		<div className="w-full flex flex-col gap-2">
			{!isAuthenticated && (
				<>
					<Button
						key="quick-account"
						onClick={handleQuickAccountClick}
						variant="outline"
						disabled={isConnecting}
						className="h-16 w-full justify-between px-5 ease-in-out duration-300 rounded-lg text-base border-primary/20 hover:border-primary/40 bg-primary/5 hover:bg-primary/10"
					>
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center shadow-sm border border-primary/20">
								<Sparkles className="h-6 w-6 text-primary" />
							</div>
							<div className="flex flex-col items-start">
								<span className="font-semibold text-base">Quick Account</span>
								<span className="text-xs text-muted-foreground">Login with social accounts</span>
							</div>
						</div>
						<ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
					</Button>

					<div className="relative my-2">
						<Separator />
						<span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-background px-2 text-xs text-muted-foreground">
							or connect wallet
						</span>
					</div>
				</>
			)}

			<div className={viewMore ? "max-h-[400px] overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent" : "space-y-2"}>
				{displayedWallets.map((enriched) => (
					<Button
						key={enriched.name}
						onClick={() => handleWalletClick(enriched)}
						variant="outline"
						disabled={isConnecting}
						className="h-16 w-full justify-between px-5 ease-in-out duration-300 rounded-lg text-base"
					>
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 rounded-lg overflow-hidden bg-background flex items-center justify-center shadow-sm border border-border/50">
								<Image
									src={enriched.icon}
									alt={enriched.title}
									width={32}
									height={32}
									className="rounded-md"
									unoptimized={true}
								/>
							</div>
							<div className="flex flex-col items-start">
								<span className="font-semibold text-base">{enriched.title}</span>
								{!enriched.isInstalled && (
									<span className="text-xs text-muted-foreground">Click to install</span>
								)}
							</div>
						</div>
						<ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
					</Button>
				))}
			</div>

			{sortedWallets.length > 6 && (
				<Button
					variant="ghost"
					onClick={() => setViewMore(!viewMore)}
					className="w-full text-sm text-muted-foreground hover:text-foreground"
				>
					{viewMore ? "View Less" : "View More"}
				</Button>
			)}
		</div>
	)
}
