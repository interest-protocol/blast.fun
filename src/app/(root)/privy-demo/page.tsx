"use client"

import { PrivyConnectButton } from "@/components/auth/privy-connect-button"
import { usePrivyAuth } from "@/hooks/privy/use-privy-auth"
import { usePrivySuiWallet } from "@/hooks/privy/use-privy-sui-wallet"
import { usePrivySuiTransaction } from "@/hooks/privy/use-privy-sui-transaction"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Copy, Wallet, Plus, Trash2, CheckCircle, XCircle, LogOut } from "lucide-react"
import copy from "copy-to-clipboard"
import toast from "react-hot-toast"
import { useState } from "react"
import { verifyPersonalMessageSignature } from "@mysten/sui/verify"

export default function PrivyDemoPage() {
	const { 
		isAuthenticated, 
		user, 
		googleEmail,
		twitterUsername,
		discordUsername,
		login,
		logout,
		linkGoogle,
		linkTwitter,
		linkDiscord,
		unlinkGoogle,
		unlinkTwitter,
		unlinkDiscord,
	} = usePrivyAuth()
	const { suiAddress, suiPublicKey, createSuiWallet, clearSuiWallet, isCreating, isLoading } = usePrivySuiWallet()
	const { signPersonalMessage } = usePrivySuiTransaction()
	const [lastSignature, setLastSignature] = useState<{ message: string; signature: string; verified?: boolean }>()

	const handleCopyAddress = (address: string) => {
		copy(address)
		toast.success("Address copied!")
	}

	const handleSignSuiMessage = async () => {
		if (!suiAddress) {
			toast.error("No Sui wallet found")
			return
		}

		const message = "Hello from BLAST.FUN!"
		const signatureData = await signPersonalMessage(message)
		if (!signatureData) {
			toast.error("Failed to sign Sui message")
			return
		}
		const { signature, bytes } = signatureData
		if (signature) {
			toast.success("Sui message signed successfully!")
			console.log("Sui Signature:", signature)
			console.log("Sui Bytes:", bytes)
			
			// @dev: Verify the signature
			try {
				const messageBytes = new TextEncoder().encode(message)
				const publicKey = await verifyPersonalMessageSignature(messageBytes, signature)
				const recoveredAddress = publicKey.toSuiAddress()
				
				const isValid = recoveredAddress.toLowerCase() === suiAddress.toLowerCase()
				
				setLastSignature({
					message,
					signature,
					verified: isValid
				})
				
				if (isValid) {
					toast.success("Signature verified successfully!")
					console.log("Recovered address:", recoveredAddress)
					console.log("Expected address:", suiAddress)
				} else {
					toast.error("Signature verification failed - address mismatch")
				}
			} catch (error) {
				console.error("Failed to verify signature:", error)
				toast.error("Failed to verify signature")
				setLastSignature({
					message,
					signature,
					verified: false
				})
			}
		}
	}

	return (
		<div className="container mx-auto py-10 max-w-4xl">
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-2">Privy + Sui Integration Demo</h1>
				<p className="text-muted-foreground">
					Connect with social accounts and use Sui wallet for transactions via Nexa backend
				</p>
			</div>

			{/* @dev: Connection Status */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Connection Status</CardTitle>
					<CardDescription>Your authentication state</CardDescription>
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
						<div className="flex items-center gap-2">
							{isAuthenticated ? (
								<Button
									variant="destructive"
									onClick={logout}
									className="flex items-center gap-2"
								>
									<LogOut className="h-4 w-4" />
									Disconnect All
								</Button>
							) : (
								<PrivyConnectButton />
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			{isAuthenticated && (
				<>
					{/* @dev: Linked Accounts */}
					<Card className="mb-6">
						<CardHeader>
							<CardTitle>Linked Accounts</CardTitle>
							<CardDescription>Your connected social accounts</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* @dev: Google Account */}
							<div className="p-4 rounded-lg border bg-card">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<span className="font-semibold">Google</span>
									</div>
									{googleEmail ? (
										<div className="flex items-center gap-2">
											<code className="text-sm bg-muted px-2 py-1 rounded">
												{googleEmail}
											</code>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => {
													const googleAccount = user?.linkedAccounts?.find((a: any) => a.type === "google_oauth")
													if (googleAccount?.subject) unlinkGoogle(googleAccount.subject)
												}}
											>
												Unlink
											</Button>
										</div>
									) : (
										<Button
											variant="outline"
											size="sm"
											onClick={linkGoogle}
										>
											Link Google
										</Button>
									)}
								</div>
							</div>

							{/* @dev: Twitter Account */}
							<div className="p-4 rounded-lg border bg-card">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<span className="font-semibold">Twitter</span>
									</div>
									{twitterUsername ? (
										<div className="flex items-center gap-2">
											<code className="text-sm bg-muted px-2 py-1 rounded">
												@{twitterUsername}
											</code>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => {
													const twitterAccount = user?.linkedAccounts?.find((a: any) => a.type === "twitter_oauth")
													if (twitterAccount?.subject) unlinkTwitter(twitterAccount.subject)
												}}
											>
												Unlink
											</Button>
										</div>
									) : (
										<Button
											variant="outline"
											size="sm"
											onClick={linkTwitter}
										>
											Link Twitter
										</Button>
									)}
								</div>
							</div>

							{/* @dev: Discord Account */}
							<div className="p-4 rounded-lg border bg-card">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<span className="font-semibold">Discord</span>
									</div>
									{discordUsername ? (
										<div className="flex items-center gap-2">
											<code className="text-sm bg-muted px-2 py-1 rounded">
												{discordUsername}
											</code>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => {
													const discordAccount = user?.linkedAccounts?.find((a: any) => a.type === "discord_oauth")
													if (discordAccount?.subject) unlinkDiscord(discordAccount.subject)
												}}
											>
												Unlink
											</Button>
										</div>
									) : (
										<Button
											variant="outline"
											size="sm"
											onClick={linkDiscord}
										>
											Link Discord
										</Button>
									)}
								</div>
							</div>
						</CardContent>
					</Card>

					{/* @dev: Wallet Management */}
					<Card className="mb-6">
						<CardHeader>
							<CardTitle>Sui Wallet Management</CardTitle>
							<CardDescription>Managed by Nexa backend</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* @dev: Sui Wallet */}
							{isLoading ? (
								<div className="p-4 rounded-lg border bg-card">
									<p className="text-sm text-muted-foreground">Loading wallet...</p>
								</div>
							) : suiAddress ? (
								<div className="p-4 rounded-lg border bg-card">
									<div className="flex items-center justify-between mb-2">
										<div className="flex items-center gap-2">
											<Wallet className="h-4 w-4 text-blue-500" />
											<span className="font-semibold">Sui Wallet</span>
										</div>
										<Badge variant="outline">Active</Badge>
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
										Managed securely by Nexa backend server
									</p>
								</div>
							) : (
								<div className="p-4 rounded-lg border border-dashed">
									<p className="text-sm text-muted-foreground mb-3">
										No Sui wallet found. Create one to start transacting on Sui.
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

							{/* @dev: Signature Verification Result */}
							{lastSignature && (
								<div className="mt-4 p-4 rounded-lg border bg-card">
									<div className="flex items-center justify-between mb-2">
										<span className="font-semibold text-sm">Last Signature</span>
										<Badge variant={lastSignature.verified ? "default" : "destructive"}>
											{lastSignature.verified ? (
												<>
													<CheckCircle className="h-3 w-3 mr-1" />
													Verified
												</>
											) : (
												<>
													<XCircle className="h-3 w-3 mr-1" />
													Invalid
												</>
											)}
										</Badge>
									</div>
									<div className="space-y-2">
										<div>
											<p className="text-xs text-muted-foreground">Message:</p>
											<code className="text-xs bg-muted px-2 py-1 rounded block mt-1">
												{lastSignature.message}
											</code>
										</div>
										<div>
											<p className="text-xs text-muted-foreground">Signature:</p>
											<code className="text-xs bg-muted px-2 py-1 rounded block mt-1 break-all">
												{lastSignature.signature.slice(0, 50)}...
											</code>
										</div>
									</div>
								</div>
							)}
						</CardContent>
					</Card>

					{/* @dev: Integration Details */}
					<Card className="mb-6">
						<CardHeader>
							<CardTitle>How It Works</CardTitle>
							<CardDescription>Understanding the Privy + Nexa integration</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="p-3 rounded-lg bg-muted">
								<p className="text-sm font-semibold mb-1">1. Social Authentication</p>
								<p className="text-xs text-muted-foreground">
									Login with Google, Twitter, or Discord through Privy for secure authentication.
								</p>
							</div>
							<div className="p-3 rounded-lg bg-muted">
								<p className="text-sm font-semibold mb-1">2. Sui Wallet Management</p>
								<p className="text-xs text-muted-foreground">
									Sui wallet is created and managed on Nexa's secure backend. Private keys never touch the client.
								</p>
							</div>
							<div className="p-3 rounded-lg bg-muted">
								<p className="text-sm font-semibold mb-1">3. Transaction Signing</p>
								<p className="text-xs text-muted-foreground">
									All Sui transactions are signed server-side via Nexa API, ensuring maximum security.
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