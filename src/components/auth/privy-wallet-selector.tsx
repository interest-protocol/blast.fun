"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { usePrivyAuth } from "@/hooks/privy/use-privy-auth"
import { Wallet, ChevronRight } from "lucide-react"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"

interface PrivyWalletSelectorProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onWalletSelected?: () => void
}

const SUPPORTED_WALLETS = [
	{
		name: "Phantom",
		icon: "https://raw.githubusercontent.com/solana-labs/wallet-adapter/master/packages/wallets/phantom/src/icon.ts",
		id: "phantom",
	},
	{
		name: "Solflare",
		icon: "https://raw.githubusercontent.com/solana-labs/wallet-adapter/master/packages/wallets/solflare/src/icon.ts",
		id: "solflare",
	},
	{
		name: "OKX Wallet",
		icon: "https://www.okx.com/cdn/assets/imgs/247/58E63FEA47A2B7D7.png",
		id: "okx",
	},
	{
		name: "Backpack",
		icon: "https://raw.githubusercontent.com/coral-xyz/backpack/master/assets/backpack.png",
		id: "backpack",
	},
]

export function PrivyWalletSelector({ open, onOpenChange, onWalletSelected }: PrivyWalletSelectorProps) {
	const { login, isLoading } = usePrivyAuth()
	const [selectedWallet, setSelectedWallet] = useState<string | null>(null)

	const handleWalletSelect = async (walletId: string) => {
		setSelectedWallet(walletId)
		try {
			await login()
			onWalletSelected?.()
			onOpenChange(false)
		} catch (error) {
			console.error("Failed to connect wallet:", error)
		} finally {
			setSelectedWallet(null)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Connect Wallet</DialogTitle>
					<DialogDescription>
						Connect your Solana wallet to continue
					</DialogDescription>
				</DialogHeader>

				<div className="w-full flex flex-col gap-2">
					{SUPPORTED_WALLETS.map((wallet) => (
						<Button
							key={wallet.id}
							onClick={() => handleWalletSelect(wallet.id)}
							variant="outline"
							disabled={isLoading || selectedWallet === wallet.id}
							className="h-16 w-full justify-between px-5 ease-in-out duration-300 rounded-lg text-base"
						>
							<div className="flex items-center gap-3">
								{isLoading && selectedWallet === wallet.id ? (
									<Skeleton className="h-10 w-10 rounded-lg" />
								) : (
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
								)}
								<div className="flex flex-col items-start">
									<span className="font-semibold text-base">{wallet.name}</span>
									{isLoading && selectedWallet === wallet.id && (
										<span className="text-xs text-muted-foreground">Connecting...</span>
									)}
								</div>
							</div>
							<ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
						</Button>
					))}
				</div>

				<div className="text-center mt-4">
					<p className="text-xs text-muted-foreground">
						By connecting, you agree to our Terms of Service and Privacy Policy
					</p>
				</div>
			</DialogContent>
		</Dialog>
	)
}