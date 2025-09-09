"use client"

import { SLUSH_WALLET_BYPASS_TOKEN, isSlushWalletBrowser } from "@/lib/slush-wallet-detector"
import { getWallets } from "@mysten/wallet-standard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Smartphone, Monitor, Wallet } from "lucide-react"
import { useEffect, useState } from "react"

export default function SlushWalletTestPage() {
	const [isSlush, setIsSlush] = useState(false)
	const [isMobile, setIsMobile] = useState(false)
	const [walletsList, setWalletsList] = useState<string[]>([])
	const [windowProperties, setWindowProperties] = useState<string[]>([])
	const [userAgent, setUserAgent] = useState("")

	useEffect(() => {
		// @dev: Check if Slush wallet is detected
		const slushDetected = isSlushWalletBrowser()
		setIsSlush(slushDetected)

		// @dev: Check if mobile device
		const mobileDetected = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
			navigator.userAgent
		)
		setIsMobile(mobileDetected)
		setUserAgent(navigator.userAgent)

		// @dev: Get list of registered wallets
		try {
			const walletsApi = getWallets()
			const wallets = walletsApi.get()
			setWalletsList(wallets.map(w => w.name))
		} catch (error) {
			console.error("Failed to get wallets:", error)
			setWalletsList([])
		}

		// @dev: Check window properties
		const props: string[] = []
		if ((window as any).slush !== undefined) props.push("window.slush")
		if ((window as any).slushWallet !== undefined) props.push("window.slushWallet")
		if ((window as any).SlushWallet !== undefined) props.push("window.SlushWallet")
		if ((window as any).sui?.slush !== undefined) props.push("window.sui.slush")
		setWindowProperties(props)
	}, [])

	return (
		<div className="container max-w-4xl mx-auto p-4 space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">Slush Wallet Detection Test</CardTitle>
					<CardDescription>
						This page helps diagnose if you're using Slush wallet in a mobile browser
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Main Detection Result */}
					<div className="p-6 rounded-lg border-2 border-border bg-muted/5">
						<div className="flex items-center justify-between">
							<div className="space-y-2">
								<h3 className="text-lg font-semibold">Slush Wallet Detected:</h3>
								<p className="text-sm text-muted-foreground">
									{isSlush 
										? "Your browser has been identified as Slush wallet. Turnstile verification will be bypassed."
										: "Slush wallet not detected. Standard Turnstile verification will be required."}
								</p>
							</div>
							<div className="flex items-center gap-2">
								{isSlush ? (
									<>
										<CheckCircle2 className="h-8 w-8 text-green-500" />
										<Badge className="bg-green-500/10 text-green-600 border-green-500/30">
											YES
										</Badge>
									</>
								) : (
									<>
										<XCircle className="h-8 w-8 text-red-500" />
										<Badge className="bg-red-500/10 text-red-600 border-red-500/30">
											NO
										</Badge>
									</>
								)}
							</div>
						</div>
					</div>

					{/* Device Type */}
					<div className="space-y-3">
						<h3 className="text-lg font-semibold flex items-center gap-2">
							{isMobile ? <Smartphone className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
							Device Type
						</h3>
						<div className="p-4 rounded-lg border bg-background">
							<div className="flex items-center justify-between">
								<span className="text-sm">Mobile Device:</span>
								<Badge variant={isMobile ? "default" : "secondary"}>
									{isMobile ? "Yes" : "No"}
								</Badge>
							</div>
						</div>
					</div>

					{/* Registered Wallets */}
					<div className="space-y-3">
						<h3 className="text-lg font-semibold flex items-center gap-2">
							<Wallet className="h-5 w-5" />
							Registered Wallets ({walletsList.length})
						</h3>
						<div className="p-4 rounded-lg border bg-background">
							{walletsList.length > 0 ? (
								<div className="space-y-2">
									{walletsList.map((wallet, index) => (
										<div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
											<span className="text-sm">{wallet}</span>
											{wallet.toLowerCase().includes("slush") && (
												<Badge className="bg-green-500/10 text-green-600 border-green-500/30">
													Slush Detected
												</Badge>
											)}
										</div>
									))}
								</div>
							) : (
								<p className="text-sm text-muted-foreground">No wallets detected via Wallet Standard</p>
							)}
						</div>
					</div>

					{/* Window Properties */}
					<div className="space-y-3">
						<h3 className="text-lg font-semibold">Window Properties</h3>
						<div className="p-4 rounded-lg border bg-background">
							{windowProperties.length > 0 ? (
								<div className="space-y-2">
									{windowProperties.map((prop, index) => (
										<div key={index} className="flex items-center gap-2">
											<CheckCircle2 className="h-4 w-4 text-green-500" />
											<code className="text-sm">{prop}</code>
										</div>
									))}
								</div>
							) : (
								<p className="text-sm text-muted-foreground">No Slush-related window properties found</p>
							)}
						</div>
					</div>

					{/* User Agent */}
					<div className="space-y-3">
						<h3 className="text-lg font-semibold">User Agent</h3>
						<div className="p-4 rounded-lg border bg-background">
							<code className="text-xs break-all">{userAgent}</code>
							{userAgent.toLowerCase().includes("slush") && (
								<Badge className="mt-2 bg-green-500/10 text-green-600 border-green-500/30">
									Contains "slush"
								</Badge>
							)}
						</div>
					</div>

					{/* Bypass Token Info */}
					<div className="space-y-3">
						<h3 className="text-lg font-semibold">Bypass Token</h3>
						<div className="p-4 rounded-lg border bg-background">
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<span className="text-sm">Token Value:</span>
									<code className="text-xs">{SLUSH_WALLET_BYPASS_TOKEN}</code>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm">Will be used:</span>
									<Badge variant={isSlush ? "default" : "secondary"}>
										{isSlush ? "Yes" : "No"}
									</Badge>
								</div>
							</div>
						</div>
					</div>

					{/* Instructions */}
					<div className="mt-6 p-4 rounded-lg border border-blue-500/30 bg-blue-500/5">
						<h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">Testing Instructions</h4>
						<ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
							<li>Open this page in Slush wallet's built-in browser on your mobile device</li>
							<li>Check if "Slush Wallet Detected" shows YES</li>
							<li>If YES, Turnstile verification will be automatically bypassed when trading</li>
							<li>If NO, ensure you're using Slush wallet's browser, not a regular mobile browser</li>
						</ol>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}