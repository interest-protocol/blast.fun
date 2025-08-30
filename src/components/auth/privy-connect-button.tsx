"use client"

import { Button } from "@/components/ui/button"
import { usePrivyAuth } from "@/hooks/privy/use-privy-auth"
import { Wallet } from "lucide-react"
import { useState } from "react"
import { PrivyWalletDialog } from "./privy-wallet-dialog"

interface PrivyConnectButtonProps {
	className?: string
	variant?: "default" | "outline" | "ghost"
}

export function PrivyConnectButton({ className, variant = "default" }: PrivyConnectButtonProps) {
	const { isAuthenticated, isReady, login, logout, solanaAddress } = usePrivyAuth()
	const [showWalletDialog, setShowWalletDialog] = useState(false)

	if (!isReady) {
		return (
			<Button variant={variant} className={className} disabled>
				<Wallet className="mr-2 h-4 w-4" />
				Loading...
			</Button>
		)
	}

	if (isAuthenticated && solanaAddress) {
		return (
			<>
				<Button
					variant={variant}
					className={className}
					onClick={() => setShowWalletDialog(true)}
				>
					<Wallet className="mr-2 h-4 w-4" />
					{solanaAddress.slice(0, 4)}...{solanaAddress.slice(-4)}
				</Button>
				<PrivyWalletDialog
					open={showWalletDialog}
					onOpenChange={setShowWalletDialog}
				/>
			</>
		)
	}

	return (
		<Button
			variant={variant}
			className={className}
			onClick={login}
		>
			<Wallet className="mr-2 h-4 w-4" />
			Connect Wallet
		</Button>
	)
}