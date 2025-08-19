"use client"

import { formatAddress } from "@mysten/sui/utils"
import { useResolveSuiNSName } from "@mysten/dapp-kit"
import { Wallet, Check } from "lucide-react"
import { useApp } from "@/context/app.context"

interface WalletAccountItemProps {
	account: any
	isActive: boolean
	onSelect: () => void
}

function WalletAccountItem({ account, isActive, onSelect }: WalletAccountItemProps) {
	const { data: domain } = useResolveSuiNSName(account.address)
	
	// Show the address directly - either SuiNS domain or formatted address
	const displayAddress = domain || formatAddress(account.address)
	
	return (
		<button
			className="w-full p-2 flex items-center justify-between hover:bg-muted rounded-lg transition-colors"
			onClick={onSelect}
		>
			<div className="flex items-center gap-2">
				<Wallet className="w-4 h-4 text-muted-foreground" />
				<span className="text-sm">
					{displayAddress}
				</span>
			</div>
			{isActive && (
				<Check className="w-4 h-4 text-primary" />
			)}
		</button>
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