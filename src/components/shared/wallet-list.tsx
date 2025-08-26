"use client"

import { useWallets } from "@mysten/dapp-kit"
import type { WalletWithRequiredFeatures } from "@mysten/wallet-standard"
import { ChevronRight } from "lucide-react"
import Image from "next/image"
import { useMounted } from "@/hooks/use-mounted"
import { getWalletUniqueIdentifier } from "@/utils/wallet"
import { Button } from "../ui/button"
import { Skeleton } from "../ui/skeleton"

type WalletListProps = {
	onSelect: (wallet: WalletWithRequiredFeatures) => Promise<void>
	isConnecting?: boolean
}

export function WalletList({ onSelect, isConnecting = false }: WalletListProps) {
	const wallets = useWallets()
	const isMounted = useMounted()

	if (!isMounted) {
		return (
			<div className="flex flex-col gap-2">
				{Array.from({ length: 3 }).map((_, i) => (
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
	
	// @dev: Custom wallet ordering - Slush first, then OKX, then Phantom, then the rest
	const sortedWallets = [...wallets].sort((a, b) => {
		const orderMap: Record<string, number> = {
			"Slush": 1,
			"OKX Wallet": 2,
			"Phantom": 3,
		}
		
		const aOrder = orderMap[a.name] || 999
		const bOrder = orderMap[b.name] || 999
		
		if (aOrder !== bOrder) {
			return aOrder - bOrder
		}
		
		return a.name.localeCompare(b.name)
	})
	
	// @dev: Find the position to insert OKX wallet placeholder if not installed
	const slushIndex = sortedWallets.findIndex(w => w.name === "Slush")
	const phantomIndex = sortedWallets.findIndex(w => w.name === "Phantom")
	const okxInsertIndex = slushIndex !== -1 ? slushIndex + 1 : (phantomIndex !== -1 ? phantomIndex : 0)

	return (
		<div className="w-full flex flex-col gap-2">
			{/* @dev: Insert OKX wallet placeholder after Slush if OKX is not installed */}
			{!hasOKXWallet && sortedWallets.length > 0 && okxInsertIndex <= sortedWallets.length && (
				<>
					{sortedWallets.slice(0, okxInsertIndex).map((wallet) => (
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
					{sortedWallets.slice(okxInsertIndex).map((wallet) => (
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
				</>
			)}
			{/* @dev: Show all wallets normally if OKX is already installed */}
			{(hasOKXWallet || sortedWallets.length === 0) && sortedWallets.map((wallet) => (
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
		</div>
	)
}
