"use client"

import { useWallets } from "@mysten/dapp-kit"
import type { WalletWithRequiredFeatures } from "@mysten/wallet-standard"
import { ChevronRight, Sparkles } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useMounted } from "@/hooks/use-mounted"
import { getWalletUniqueIdentifier } from "@/utils/wallet"
import { Button } from "../ui/button"
import { Skeleton } from "../ui/skeleton"
import { usePrivyAuth } from "@/hooks/privy/use-privy-auth"
import { Separator } from "../ui/separator"

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

	const handleQuickAccountClick = () => {
		// @dev: Navigate to home with quick_wallet_signin param and keep dialog open
		router.push("/?quick_wallet_signin=true")
		// Close the current dialog if exists
		if (onClose) {
			onClose()
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

	// @dev: Check if OKX wallet is installed
	const hasOKXWallet = wallets.some(wallet => wallet.name === "OKX Wallet")
	
	// @dev: Custom wallet ordering - Quick Account first, then Slush, OKX, Phantom, and the rest
	const sortedWallets = [...wallets].sort((a, b) => {
		const orderMap: Record<string, number> = {
			"Slush": 2,
			"OKX Wallet": 3,
			"Phantom": 4,
		}
		
		const aOrder = orderMap[a.name] || 999
		const bOrder = orderMap[b.name] || 999
		
		if (aOrder !== bOrder) {
			return aOrder - bOrder
		}
		
		return a.name.localeCompare(b.name)
	})

	return (
		<div className="w-full flex flex-col gap-2">
			{/* @dev: Quick Account Option - Only show if not already authenticated */}
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
								<span className="text-xs text-muted-foreground">
									Login with social accounts
								</span>
							</div>
						</div>
						<ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
					</Button>

					{/* @dev: Separator between Quick Account and regular wallets */}
					<div className="relative my-2">
						<Separator />
						<span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-background px-2 text-xs text-muted-foreground">
							or connect wallet
						</span>
					</div>
				</>
			)}

			{/* @dev: Regular wallet options */}
			{sortedWallets.map((wallet) => (
				<Button
					key={getWalletUniqueIdentifier(wallet)}
					onClick={() => onSelect(wallet)}
					variant="outline"
					disabled={isConnecting}
					className="h-16 w-full justify-between px-5 ease-in-out duration-300 rounded-lg text-base"
				>
					<div className="flex items-center gap-3">
						{wallet.icon && typeof wallet.icon === "string" ? (
							<div className="h-10 w-10 rounded-lg overflow-hidden bg-background flex items-center justify-center shadow-sm border border-border/50">
								<Image
									src={wallet.icon}
									alt={wallet.name}
									width={32}
									height={32}
									className="rounded-md"
									unoptimized={true}
								/>
							</div>
						) : (
							wallet.icon
						)}
						<div className="flex flex-col items-start">
							<span className="font-semibold text-base">{wallet.name}</span>
						</div>
					</div>
					<ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
				</Button>
			))}

			{/* @dev: OKX Wallet install option if not present */}
			{!hasOKXWallet && (
				<Button
					key="okx-wallet-placeholder"
					onClick={() => window.open("https://web3.okx.com/download", "_blank")}
					variant="outline"
					disabled={isConnecting}
					className="h-16 w-full justify-between px-5 ease-in-out duration-300 rounded-lg text-base"
				>
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-lg overflow-hidden bg-background flex items-center justify-center shadow-sm border border-border/50">
							<Image
								src="https://www.okx.com/cdn/assets/imgs/247/58E63FEA47A2B7D7.png"
								alt="OKX Wallet"
								width={32}
								height={32}
								className="rounded-md"
								unoptimized={true}
							/>
						</div>
						<div className="flex flex-col items-start">
							<span className="font-semibold text-base">OKX Wallet</span>
							<span className="text-xs text-muted-foreground">Click to install</span>
						</div>
					</div>
					<ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
				</Button>
			)}
		</div>
	)
}