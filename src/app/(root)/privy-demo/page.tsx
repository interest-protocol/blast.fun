"use client"

import { PrivyConnectButton } from "@/components/auth/privy-connect-button"
import { usePrivyAuth } from "@/hooks/privy/use-privy-auth"
import { usePrivySuiWallet } from "@/hooks/privy/use-privy-sui-wallet"
import { usePrivySuiTransaction } from "@/hooks/privy/use-privy-sui-transaction"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Copy, Wallet, Plus, Trash2 } from "lucide-react"
import copy from "copy-to-clipboard"
import toast from "react-hot-toast"

export default function PrivyDemoPage() {
	const { isAuthenticated, user, solanaAddress } = usePrivyAuth()
	const { suiAddress, suiPublicKey, createSuiWallet, clearSuiWallet, isCreating } = usePrivySuiWallet()
	const { signMessage } = usePrivySuiTransaction()

	const handleCopyAddress = (address: string) => {
		copy(address)
		toast.success("Address copied!")
	}

	const handleSignSuiMessage = async () => {
		const message = "Hello from BLAST.FUN!"
		const signature = await signMessage(message)
		if (signature) {
			toast.success("Sui message signed successfully!")
			console.log("Sui Signature:", signature)
		}
	}

	return (
		<div className="container mx-auto py-10 max-w-4xl">
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-2">Privy + Sui Integration Demo</h1>
				<p className="text-muted-foreground">
					Connect your Solana wallet for authentication and create a Sui wallet for transactions
				</p>
			</div>

			{/* @dev: Connection Status */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Connection Status</CardTitle>
					<CardDescription>Your wallet connection state</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<Badge variant={isAuthenticated ? "default" : "secondary"}>
								{isAuthenticated ? "Connected" : "Disconnected"}
							</Badge>
							{suiAddress && (
								<Badge variant="outline">Sui Wallet Active</Badge>
							)}
						</div>
						<PrivyConnectButton />
					</div>
				</CardContent>
			</Card>

			{isAuthenticated && (
				<>
					{/* @dev: Wallet Information */}
					<Card className="mb-6">
						<CardHeader>
							<CardTitle>Wallet Management</CardTitle>
							<CardDescription>Your connected wallets</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* @dev: Solana Wallet (Authentication) */}
							{solanaAddress && (
								<div className="p-4 rounded-lg border bg-card">
									<div className="flex items-center justify-between mb-2">
										<div className="flex items-center gap-2">
											<Wallet className="h-4 w-4 text-purple-500" />
											<span className="font-semibold">Solana Wallet</span>
										</div>
										<Badge variant="outline">Authentication</Badge>
									</div>
									<div className="flex items-center gap-2">
										<code className="text-sm bg-muted px-2 py-1 rounded flex-1 truncate">
											{solanaAddress}
										</code>
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8"
											onClick={() => handleCopyAddress(solanaAddress)}
										>
											<Copy className="h-3 w-3" />
										</Button>
									</div>
									<p className="text-xs text-muted-foreground mt-2">
										Used for authentication with Privy
									</p>
								</div>
							)}

							{/* @dev: Sui Wallet (Transactions) */}
							{suiAddress ? (
								<div className="p-4 rounded-lg border bg-card">
									<div className="flex items-center justify-between mb-2">
										<div className="flex items-center gap-2">
											<Wallet className="h-4 w-4 text-blue-500" />
											<span className="font-semibold">Sui Wallet</span>
										</div>
										<Badge variant="outline">Transactions</Badge>
									</div>
									<div className="flex items-center gap-2">
										<code className="text-sm bg-muted px-2 py-1 rounded flex-1 truncate">
											{suiAddress}
										</code>
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8"
											onClick={() => handleCopyAddress(suiAddress)}
										>
											<Copy className="h-3 w-3" />
										</Button>
									</div>
									{suiPublicKey && (
										<div className="mt-2">
											<p className="text-xs text-muted-foreground">Public Key:</p>
											<code className="text-xs bg-muted px-2 py-1 rounded block mt-1 truncate">
												{suiPublicKey}
											</code>
										</div>
									)}
									<p className="text-xs text-muted-foreground mt-2">
										Used for Sui blockchain transactions
									</p>
								</div>
							) : (
								<div className="p-4 rounded-lg border border-dashed">
									<p className="text-sm text-muted-foreground mb-3">
										No Sui wallet created yet. Create one to start transacting on Sui.
									</p>
									<Button
										onClick={createSuiWallet}
										disabled={isCreating}
										size="sm"
										className="w-full"
									>
										<Plus className="h-4 w-4 mr-2" />
										{isCreating ? "Creating..." : "Create Sui Wallet"}
									</Button>
								</div>
							)}

							<Separator />

							{/* @dev: Actions */}
							<div className="flex gap-2">
								{suiAddress && (
									<>
										<Button
											onClick={handleSignSuiMessage}
											variant="outline"
										>
											Sign Sui Message
										</Button>
										<Button
											onClick={clearSuiWallet}
											variant="destructive"
											size="icon"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</>
								)}
							</div>
						</CardContent>
					</Card>

					{/* @dev: Integration Details */}
					<Card className="mb-6">
						<CardHeader>
							<CardTitle>How It Works</CardTitle>
							<CardDescription>Understanding the Privy + Sui integration</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="p-3 rounded-lg bg-muted">
								<p className="text-sm font-semibold mb-1">1. Solana Authentication</p>
								<p className="text-xs text-muted-foreground">
									Connect your Solana wallet (Phantom, Solflare, etc.) through Privy for secure authentication.
								</p>
							</div>
							<div className="p-3 rounded-lg bg-muted">
								<p className="text-sm font-semibold mb-1">2. Sui Wallet Creation</p>
								<p className="text-xs text-muted-foreground">
									Generate a local Ed25519 keypair for Sui transactions. The wallet is stored locally (encrypted in production).
								</p>
							</div>
							<div className="p-3 rounded-lg bg-muted">
								<p className="text-sm font-semibold mb-1">3. Transaction Signing</p>
								<p className="text-xs text-muted-foreground">
									Sign Sui transactions using the local keypair with Ed25519 signatures, compatible with Sui's requirements.
								</p>
							</div>
						</CardContent>
					</Card>

					{/* @dev: User Details */}
					{user && (
						<Card>
							<CardHeader>
								<CardTitle>User Details</CardTitle>
								<CardDescription>Raw user object from Privy</CardDescription>
							</CardHeader>
							<CardContent>
								<pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
									{JSON.stringify(user, null, 2)}
								</pre>
							</CardContent>
						</Card>
					)}
				</>
			)}
		</div>
	)
}