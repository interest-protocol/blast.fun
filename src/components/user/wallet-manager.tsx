"use client"

import { useResolveSuiNSName } from "@mysten/dapp-kit"
import { formatAddress } from "@mysten/sui/utils"
import { Check, CheckCircle2, Copy, Wallet } from "lucide-react"
import { useApp } from "@/context/app.context"
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
		<div className="group flex w-full items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted">
			<button className="flex flex-1 items-center gap-2" onClick={onSelect}>
				<Wallet className="h-4 w-4 text-muted-foreground" />
				<span className="text-sm">{displayAddress}</span>
			</button>
			<div className="flex items-center gap-1">
				<button type="button" onClick={handleCopy} className="rounded p-1 transition-all hover:bg-background">
					{copied ? (
						<CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
					) : (
						<Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
					)}
				</button>
				{isActive && <Check className="h-4 w-4 text-primary" />}
			</div>
		</div>
	)
}

export function WalletManager() {
	const { accounts, currentAccount, switchAccount } = useApp()

	return (
		<div className="space-y-3">
			<div className="mb-2">
				<h3 className="font-semibold text-sm">Connected Wallets</h3>
			</div>

			<div className="max-h-[50vh] space-y-2 overflow-y-auto">
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
				<div className="py-6 text-center text-muted-foreground text-sm">No wallets connected</div>
			)}
		</div>
	)
}
