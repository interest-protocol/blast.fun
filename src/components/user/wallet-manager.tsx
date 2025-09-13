"use client"

import { formatAddress } from "@mysten/sui/utils"
import { useResolveSuiNSName } from "@mysten/dapp-kit"
import { Wallet, Check, Copy, CheckCircle2, Sparkles, Plus } from "lucide-react"
import { useApp } from "@/context/app.context"
import { useRouter } from "next/navigation"
import { useClipboard } from "@/hooks/use-clipboard"
import { useUnifiedWallet } from "@/hooks/use-unified-wallet"
import { usePrivyAuth } from "@/hooks/privy/use-privy-auth"
import { usePrivySuiWallet } from "@/hooks/privy/use-privy-sui-wallet"
import { Button } from "@/components/ui/button"

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

interface WalletManagerProps {
	onClosePopover?: () => void
}

export function WalletManager({ onClosePopover }: WalletManagerProps = {}) {
	const { accounts, currentAccount, switchAccount, setIsConnectDialogOpen } = useApp()
	const { walletType, address: unifiedAddress, switchToWallet, hasStandardWallet, hasPrivyWallet } = useUnifiedWallet()
	const { isAuthenticated: isPrivyAuthenticated } = usePrivyAuth()
	const { suiAddress: privySuiAddress } = usePrivySuiWallet()
	const { copy, copied } = useClipboard()
	const router = useRouter()
	
	// @dev: Check if we have any connections (Quick Account or standard wallets)
	// Quick Account should show whenever authenticated, regardless of which wallet is active
	const hasQuickAccount = isPrivyAuthenticated
	const hasStandardWallets = accounts.length > 0
	const hasAnyConnection = hasQuickAccount || hasStandardWallets
	
	// @dev: Get Quick Account address - either from unified wallet or directly from Privy
	const quickAccountAddress = walletType === "privy" ? unifiedAddress : privySuiAddress
	
	const handleCopyQuickAccount = (e: React.MouseEvent) => {
		e.stopPropagation()
		if (quickAccountAddress) {
			copy(quickAccountAddress)
		}
	}
	
	return (
		<div className="space-y-3">
			<div className="mb-2">
				<h3 className="text-sm font-semibold">Connected Wallets</h3>
			</div>
			
			<div className="space-y-2 max-h-[50vh] overflow-y-auto">
				{/* @dev: Show Quick Account if connected */}
				{hasQuickAccount && quickAccountAddress && (
					<button
						className="w-full p-2 flex items-center justify-between hover:bg-muted rounded-lg transition-colors group"
						onClick={() => {
							// @dev: Switch to Quick Account if not already active
							if (walletType !== "privy" && hasPrivyWallet) {
								switchToWallet("privy")
							}
						}}
					>
						<div className="flex items-center gap-2 flex-1">
							<Sparkles className="w-4 h-4 text-primary" />
							<div className="flex flex-col items-start">
								<span className="text-sm font-medium">Quick Account</span>
								<span className="text-xs text-muted-foreground">
									{formatAddress(quickAccountAddress)}
								</span>
							</div>
						</div>
						<div className="flex items-center gap-1">
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation()
									handleCopyQuickAccount(e)
								}}
								className="p-1 hover:bg-background rounded transition-all"
							>
								{copied ? (
									<CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
								) : (
									<Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
								)}
							</button>
							{walletType === "privy" && (
								<Check className="w-4 h-4 text-primary" />
							)}
						</div>
					</button>
				)}
				
				{/* @dev: Show standard wallet accounts */}
				{accounts.map((account) => (
					<WalletAccountItem
						key={account.address}
						account={account}
						isActive={walletType === "standard" && account.address === currentAccount?.address}
						onSelect={() => {
							// @dev: Switch to standard wallet first if needed
							if (walletType !== "standard" && hasStandardWallet) {
								switchToWallet("standard")
							}
							// @dev: Then switch account if different
							if (account.address !== currentAccount?.address) {
								switchAccount(account)
							}
						}}
					/>
				))}
				
				{/* @dev: Show connect options when only one type is connected */}
				{hasQuickAccount && !hasStandardWallets && (
					<Button
						variant="outline"
						className="w-full justify-start gap-2 h-auto py-2"
						onClick={(e) => {
							e.preventDefault()
							e.stopPropagation()
							// @dev: Close popover and open dialog with proper delay
							onClosePopover?.()
							// Use requestAnimationFrame to ensure popover is closed before opening dialog
							requestAnimationFrame(() => {
								setTimeout(() => {
									setIsConnectDialogOpen(true)
								}, 150)
							})
						}}
					>
						<Plus className="h-4 w-4" />
						<span className="text-sm">Connect Wallet</span>
					</Button>
				)}
				
				{hasStandardWallets && !hasQuickAccount && (
					<Button
						variant="outline"
						className="w-full justify-start gap-2 h-auto py-2"
						onClick={(e) => {
							e.preventDefault()
							e.stopPropagation()
							// @dev: Navigate to home with quick wallet sign-in param
							if (!isPrivyAuthenticated) {
								onClosePopover?.()
								router.push("/?quick_wallet_signin=true")
							}
						}}
					>
						<Plus className="h-4 w-4" />
						<span className="text-sm">Connect Quick Account</span>
					</Button>
				)}
			</div>
			
			{!hasAnyConnection && (
				<div className="text-center py-6 text-muted-foreground text-sm">
					No wallets connected
				</div>
			)}
		</div>
	)
}