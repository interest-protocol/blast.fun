"use client"

import { formatAddress } from "@mysten/sui/utils"
import { LogOut, Unplug, Wallet, Wrench } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { BsTwitterX } from "react-icons/bs"
import { useApp } from "@/context/app.context"
import { useTwitter } from "@/context/twitter.context"
import { WalletList } from "../shared/wallet-list"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { TwitterUserAvatar } from "./user-avatar"
import { WalletManager } from "./wallet-manager"

export function UserDropdown() {
	const [open, setOpen] = useState(false)

	const { user, isLoggedIn, login, logout } = useTwitter()
	const {
		isConnected,
		address,
		domain,
		disconnect,
		isConnecting,
		connect,
		isConnectDialogOpen,
		setIsConnectDialogOpen,
		accounts,
		currentAccount,
		switchAccount,
	} = useApp()

	const showConnectButton = !isConnected && !isLoggedIn
	const showTwitterOnlyState = isLoggedIn && !isConnected

	return (
		<>
			<Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
				<DialogContent className="flex max-w-md flex-col gap-0 overflow-hidden rounded-xl border-border/50 p-0 shadow-xl">
					<div className="flex w-full flex-col gap-4 p-6">
						<DialogHeader className="text-center">
							<DialogTitle className="font-bold text-xl">Connect to BLAST.FUN</DialogTitle>
							<DialogDescription className="text-sm">
								Connect with one of the available wallet providers or create a new wallet.
							</DialogDescription>
						</DialogHeader>
						<WalletList onSelect={connect} isConnecting={isConnecting} />
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
					className="rounded-xl px-2 transition-all duration-300 ease-in-out"
					onClick={() => setIsConnectDialogOpen(true)}
				>
					{user && <TwitterUserAvatar user={user} className="h-4 w-4" />}
					<span className="font-semibold text-muted-foreground text-sm transition-colors duration-300 group-hover:text-primary">
						@{user?.username || "twitter"}
					</span>
				</Button>
			)}

			{isConnected && (
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button variant="outline" className="rounded-xl px-2 transition-all duration-300 ease-in-out">
							{user && <TwitterUserAvatar user={user} className="h-4 w-4" />}
							<span className="font-semibold text-muted-foreground text-sm transition-colors duration-300 group-hover:text-primary">
								{user?.username
									? `@${user.username}`
									: currentAccount?.label || domain || formatAddress(address || "")}
							</span>
						</Button>
					</PopoverTrigger>

					<PopoverContent className="min-w-[320px] p-3" align="end">
						<div className="space-y-3">
							{/* Wallet Manager */}
							<div className="border-b pb-2">
								<WalletManager />
							</div>

							{/* Navigation Links */}
							<div className="space-y-1 border-b pb-2">
								<Link
									href="/portfolio"
									className="flex w-full items-center gap-2 rounded-lg p-2 transition-colors hover:bg-muted"
									onClick={() => setOpen(false)}
								>
									<Wallet className="h-4 w-4 text-muted-foreground" />
									<span className="font-medium text-sm">Portfolio</span>
								</Link>
								<Link
									href="/tools"
									className="flex w-full items-center gap-2 rounded-lg p-2 transition-colors hover:bg-muted"
									onClick={() => setOpen(false)}
								>
									<Wrench className="h-4 w-4 text-muted-foreground" />
									<span className="font-medium text-sm">Tools</span>
								</Link>
							</div>

							{/* Social Accounts */}
							<div className="flex flex-col gap-2">
								<span className="font-medium font-mono text-muted-foreground text-xs uppercase">
									Social Accounts
								</span>

								{isLoggedIn && user ? (
									<div className="flex items-center justify-between rounded-md bg-muted p-2">
										<div className="flex items-center gap-2">
											<TwitterUserAvatar user={user} className="h-8 w-8" />
											<span className="font-semibold text-sm">@{user.username}</span>
										</div>
										<Button variant="outline" size="icon" onClick={logout}>
											<LogOut className="h-4 w-4" />
										</Button>
									</div>
								) : (
									<Button variant="outline" className="w-full justify-start" onClick={login}>
										<span className="flex flex-grow items-center gap-2">
											<BsTwitterX className="h-4 w-4" />
											Connect X/Twitter
										</span>
									</Button>
								)}
							</div>

							<Button
								variant="outline"
								className="w-full justify-start bg-transparent text-destructive hover:bg-destructive/10"
								onClick={disconnect}
							>
								<span className="flex flex-grow items-center gap-2 text-destructive">
									<Unplug className="h-4 w-4" />
									{accounts.length > 1 ? "Disconnect All" : "Disconnect Wallet"}
								</span>
							</Button>
						</div>
					</PopoverContent>
				</Popover>
			)}
		</>
	)
}
