"use client"

import { Loader2 } from "lucide-react"
import { useApp } from "@/context/app.context"
import { WalletList } from "@/components/shared/wallet-list"
import { FC } from "react"

const WalletNotConnected: FC = () => {
	const { isConnecting, connect } = useApp()

	return (
		<div className="container max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
			{isConnecting && (
				<div className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 flex items-center justify-center">
					<div className="flex flex-col items-center space-y-6">
						<div className="relative">
							<div className="absolute inset-0 bg-primary/20 blur-2xl animate-pulse" />
							<Loader2 className="h-16 w-16 animate-spin text-foreground/60 relative" />
							<div className="absolute inset-0 animate-ping">
								<Loader2 className="h-16 w-16 text-primary opacity-10" />
							</div>
						</div>
						<div className="text-center space-y-2">
							<p className="text-sm font-mono uppercase text-foreground/80 animate-pulse tracking-wider">
								WALLET::CONNECTING
							</p>
							<p className="text-xs font-mono uppercase text-muted-foreground/60">
								ESTABLISHING_SECURE_CONNECTION...
							</p>
						</div>
					</div>
				</div>
			)}

			<div className="w-full space-y-8 text-center">
				<div className="space-y-6">
					<h1 className="text-4xl font-bold font-mono uppercase tracking-wider text-foreground/80 sm:text-5xl">
						WALLET::REQUIRED
					</h1>
					<p className="text-sm font-mono uppercase max-w-md mx-auto text-muted-foreground">
						CONNECT_WALLET_TO_LAUNCH_TOKENS
					</p>
				</div>

				<div className="w-full max-w-md mx-auto space-y-4">
					<div className="border-t border-foreground/10 pt-6">
						<p className="text-xs font-mono text-muted-foreground/60 mb-6 uppercase">AVAILABLE::WALLETS</p>
						<WalletList onSelect={connect} isConnecting={isConnecting} />
					</div>
				</div>
			</div>
		</div>
	)	
}

export default WalletNotConnected;
