"use client"

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { usePrivyAuth } from "@/hooks/privy/use-privy-auth"
import { usePrivyWallets } from "@/hooks/privy/use-privy-wallets"
import { Copy, ExternalLink, LogOut, Plus, Wallet, ChevronRight } from "lucide-react"
import copy from "copy-to-clipboard"
import toast from "react-hot-toast"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"

interface PrivyWalletDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function PrivyWalletDialog({ open, onOpenChange }: PrivyWalletDialogProps) {
	const { user, logout, linkWallet, unlinkWallet, solanaAddress } = usePrivyAuth()

	const handleCopyAddress = (address: string) => {
		copy(address)
		toast.success("Address copied to clipboard")
	}

	const handleLogout = async () => {
		await logout()
		onOpenChange(false)
	}

	const canRemoveWallet = false // @dev: Only one Solana wallet at a time

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Wallet Manager</DialogTitle>
					<DialogDescription>
						Manage your connected wallets and embedded wallets
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* @dev: Solana Wallet Section */}
					<div>
						<h3 className="text-sm font-semibold mb-2">Solana Wallet</h3>
						{solanaAddress ? (
							<div className="p-3 rounded-lg border border-border bg-card">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
											<Wallet className="h-4 w-4 text-white" />
										</div>
										<div>
											<p className="text-sm font-medium">
												{solanaAddress.slice(0, 6)}...{solanaAddress.slice(-4)}
											</p>
											<p className="text-xs text-muted-foreground">Solana</p>
										</div>
									</div>
									<div className="flex items-center gap-1">
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8"
											onClick={() => handleCopyAddress(solanaAddress)}
										>
											<Copy className="h-3 w-3" />
										</Button>
										{canRemoveWallet && (
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 text-destructive"
												onClick={() => unlinkWallet(solanaAddress)}
											>
												<LogOut className="h-3 w-3" />
											</Button>
										)}
									</div>
								</div>
							</div>
						) : (
							<Button
								variant="outline"
								className="w-full justify-between"
								onClick={linkWallet}
							>
								<span className="flex items-center gap-2">
									<Plus className="h-4 w-4" />
									Connect Solana Wallet
								</span>
								<ChevronRight className="h-4 w-4" />
							</Button>
						)}
					</div>

					<Separator />


					{/* @dev: Account Info */}
					{user && (
						<div>
							<h3 className="text-sm font-semibold mb-2">Account Info</h3>
							<div className="text-xs text-muted-foreground space-y-1">
								<p>User ID: {user.id}</p>
								{user.createdAt && (
									<p>Created: {new Date(user.createdAt).toLocaleDateString()}</p>
								)}
							</div>
						</div>
					)}

					<Separator />

					{/* @dev: Actions */}
					<div className="flex justify-end">
						<Button
							variant="destructive"
							onClick={handleLogout}
							className="w-full sm:w-auto"
						>
							<LogOut className="mr-2 h-4 w-4" />
							Disconnect All
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}