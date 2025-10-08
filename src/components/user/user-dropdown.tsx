"use client"

import { formatAddress } from "@mysten/sui/utils"
import { LogOut, Unplug, Wallet, Wrench, Lock, Coins } from "lucide-react"
import { useState } from "react"
import { useApp } from "@/context/app.context"
import { useTwitter } from "@/context/twitter.context"
import { Button } from "../ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { TwitterUserAvatar } from "./user-avatar"
import { BsTwitterX } from 'react-icons/bs'
import { WalletListWithPrivy } from "../shared/wallet-list-with-privy"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import { WalletManager } from "./wallet-manager"
import Link from "next/link"
import { useUnifiedWallet } from "@/hooks/use-unified-wallet"
import { usePrivyAuth } from "@/hooks/privy/use-privy-auth"

export function UserDropdown() {
	const [open, setOpen] = useState(false)

	const { user, isLoggedIn, login, logout } = useTwitter()
	const { isConnected, address, domain, disconnect, isConnecting, connect, isConnectDialogOpen, setIsConnectDialogOpen, accounts, currentAccount, switchAccount } = useApp()
	const { walletType } = useUnifiedWallet()
	const { isAuthenticated: isPrivyAuthenticated, logout: privyLogout } = usePrivyAuth()

	const showConnectButton = !isConnected && !isLoggedIn
	const showTwitterOnlyState = isLoggedIn && !isConnected

	return (
		<>
			<Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
				<DialogContent className="flex max-w-md flex-col gap-0 overflow-hidden p-0 rounded-xl border-border/50 shadow-xl">
					<div className="flex w-full flex-col gap-4 p-6">
						<DialogHeader className="text-center">
							<DialogTitle className="text-xl font-bold">Connect to BLAST.FUN</DialogTitle>
							<DialogDescription className="text-sm">
								Connect with one of the available wallet providers or create a new wallet.
							</DialogDescription>
						</DialogHeader>
						<WalletListWithPrivy onSelect={connect} isConnecting={isConnecting} onClose={() => setIsConnectDialogOpen(false)} />
					</div>
				</DialogContent>
			</Dialog>

			{showConnectButton && (
				<Button
					variant="outline"
					className="rounded-xl"
					disabled={isConnecting}
					onClick={() => setIsConnectDialogOpen(true)}
				>
					Connect Wallet
				</Button>
			)}

			{showTwitterOnlyState && (
				<Button
					variant="outline"
					className="rounded-xl group px-2 ease-in-out duration-300 transition-all"
					onClick={() => setIsConnectDialogOpen(true)}
				>
					{user && <TwitterUserAvatar user={user} className="h-4 w-4" />}
					<span className="text-muted-foreground group-hover:text-primary transition-colors duration-300 font-semibold text-sm">
						@{user?.username || "twitter"}
					</span>
				</Button>
			)}

			{isConnected && (
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button variant="outline" className="rounded-xl group px-2 ease-in-out duration-300 transition-all">
							{user && <TwitterUserAvatar user={user} className="h-4 w-4" />}
							<span className="text-muted-foreground group-hover:text-primary transition-colors duration-300 font-semibold text-sm">
								{user?.username ? `@${user.username}` : domain || formatAddress(address || "")}
							</span>
						</Button>
					</PopoverTrigger>

					<PopoverContent className="min-w-[320px] p-3" align="end">
						<div className="space-y-3">
							{/* Wallet Manager */}
							<div className="pb-2 border-b">
								<WalletManager onClosePopover={() => setOpen(false)} />
							</div>
							
							{/* Navigation Links */}
							<div className="pb-2 border-b space-y-1">
								<Link 
									href="/portfolio" 
									className="w-full p-2 flex items-center gap-2 hover:bg-muted rounded-lg transition-colors"
									onClick={() => setOpen(false)}
								>
									<Wallet className="w-4 h-4 text-muted-foreground" />
									<span className="text-sm font-medium">Portfolio</span>
								</Link>
								<Link 
									href="/tools" 
									className="w-full p-2 flex items-center gap-2 hover:bg-muted rounded-lg transition-colors"
									onClick={() => setOpen(false)}
								>
									<Wrench className="w-4 h-4 text-muted-foreground" />
									<span className="text-sm font-medium">Tools</span>
								</Link>
								<Link
									href="/vesting"
									className="w-full p-2 flex items-center gap-2 hover:bg-muted rounded-lg transition-colors"
									onClick={() => setOpen(false)}
								>
									<Lock className="w-4 h-4 text-muted-foreground" />
									<span className="text-sm font-medium">Vesting</span>
								</Link>
								<Link
									href="/creator-rewards"
									className="w-full p-2 flex items-center gap-2 hover:bg-muted rounded-lg transition-colors"
									onClick={() => setOpen(false)}
								>
									<Coins className="w-4 h-4 text-muted-foreground" />
									<span className="text-sm font-medium">Creator Rewards</span>
								</Link>
							</div>

							{/* Social Accounts */}
							<div className="flex flex-col gap-2">
								<span className="text-xs text-muted-foreground uppercase font-mono font-medium">
									Social Accounts
								</span>

								{isLoggedIn && user ? (
									<div className="flex items-center justify-between p-2 bg-muted rounded-md">
										<div className="flex items-center gap-2">
											<TwitterUserAvatar user={user} className="h-8 w-8" />
											<span className="text-sm font-semibold">@{user.username}</span>
										</div>
										<Button variant="outline" size="icon" onClick={logout}>
											<LogOut className="w-4 h-4" />
										</Button>
									</div>
								) : (
									<Button variant="outline" className="w-full justify-start" onClick={login}>
										<span className="flex flex-grow items-center gap-2">
											<BsTwitterX className="w-4 h-4" />
											Connect X/Twitter
										</span>
									</Button>
								)}
							</div>

							{/* Disconnect Options */}
							<div className="space-y-2">
								{/* @dev: Show Quick Account disconnect if connected */}
								{isPrivyAuthenticated && walletType === "privy" && (
									<Button
										variant="outline"
										className="w-full justify-start hover:bg-muted"
										onClick={() => privyLogout()}
									>
										<span className="flex flex-grow items-center gap-2">
											<Unplug className="w-4 h-4" />
											Disconnect Quick Account
										</span>
									</Button>
								)}
								
								{/* @dev: Show standard wallet disconnect if any connected */}
								{accounts.length > 0 && (
									<Button
										variant="outline"
										className="w-full justify-start text-destructive hover:bg-destructive/10 bg-transparent"
										onClick={disconnect}
									>
										<span className="flex flex-grow items-center gap-2 text-destructive">
											<Unplug className="w-4 h-4" />
											{accounts.length > 1 ? "Disconnect All Wallets" : "Disconnect Wallet"}
										</span>
									</Button>
								)}
							</div>
						</div>
					</PopoverContent>
				</Popover>
			)}
		</>
	)
}
