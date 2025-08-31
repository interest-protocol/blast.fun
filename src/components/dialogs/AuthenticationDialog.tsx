"use client"

import { useState } from "react"
import { useApp } from "@/context/app.context"
import { WalletListWithPrivy } from "../shared/wallet-list-with-privy"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"

export function AuthenticationDialog() {
	const {
		isConnecting,
		connect,
	} = useApp()
	
	// @dev: Local dialog state for unified wallet
	const [isOpen, setIsOpen] = useState(false)

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" className="rounded-xl" disabled={isConnecting}>
					Connect Wallet
				</Button>
			</DialogTrigger>

			<DialogContent className="flex max-w-md flex-col gap-0 overflow-hidden p-0 rounded-xl border-border/50 shadow-xl">
				<div className="flex w-full flex-col gap-4 p-6">
					<DialogHeader className="text-center">
						<DialogTitle className="text-xl font-bold">Connect to BLAST.FUN</DialogTitle>
						<DialogDescription className="text-sm">
							Connect with one of the available wallet providers or create a new wallet.
						</DialogDescription>
					</DialogHeader>

					<WalletListWithPrivy 
						onSelect={connect} 
						isConnecting={isConnecting} 
						onClose={() => setIsOpen(false)}
					/>
				</div>
			</DialogContent>
		</Dialog>
	)
}
