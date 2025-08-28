"use client"

import { formatAddress } from "@mysten/sui/utils"
import { useResolveSuiNSName } from "@mysten/dapp-kit"
import { Wallet, Check, Copy, CheckCircle2 } from "lucide-react"
import { useApp } from "@/context/app.context"
import { useState } from "react"
import { useClipboard } from "@/hooks/use-clipboard"

interface WalletAccountItemProps {
	account: any
	isActive: boolean
	onSelect: () => void
}

function WalletAccountItem({ account, isActive, onSelect }: WalletAccountItemProps) {
	const { data: domain } = useResolveSuiNSName(account.address)
	const { copy, copied } = useClipboard()
	
	// Show the address directly - either SuiNS domain or formatted address
	const displayAddress = domain || formatAddress(account.address)
	
	const handleCopy = (e: React.MouseEvent) => {
		e.stopPropagation()
		copy(account.address)
	}
	
	return (
		<div
			className="w-full p-2 flex items-center justify-between hover:bg-muted rounded-lg transition-colors group"
		>
			<button
				className="flex items-center gap-2 flex-1"
				onClick={onSelect}
			>
				<Wallet className="w-4 h-4 text-muted-foreground" />
				<span className="text-sm">
					{displayAddress}
				</span>
			</button>
			<div className="flex items-center gap-1">
				<button
					type="button"
					onClick={handleCopy}
					className="p-1 hover:bg-background rounded transition-all"
				>
					{copied ? (
						<CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
					) : (
						<Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
					)}
				</button>
				{isActive && (
					<Check className="w-4 h-4 text-primary" />
				)}
			</div>
		</div>
	)
}

export function WalletManager() {
	const { accounts, currentAccount, switchAccount } = useApp()
	
	return (
		<div className="space-y-3">
			<div className="mb-2">
				<h3 className="text-sm font-semibold">Connected Wallets</h3>
			</div>
			
			<div className="space-y-2 max-h-[50vh] overflow-y-auto">
				{accounts.map((account) => (
					<WalletAccountItem
						key={account.address}
						account={account}
						isActive={account.address === currentAccount?.address}
						onSelect={() => {
							if (account.address !== currentAccount?.address) {
								switchAccount(account)
							}
						}}
					/>
				))}
			</div>
			
			{accounts.length === 0 && (
				<div className="text-center py-6 text-muted-foreground text-sm">
					No wallets connected
				</div>
			)}
		</div>
	)
}