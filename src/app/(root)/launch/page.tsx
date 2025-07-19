"use client"

import { useState } from "react"
import { useApp } from "@/context/app.context"
import CreateTokenForm from "./_components/create-token-form"
import { useTwitter } from "@/context/twitter.context"
import { WalletList } from "@/components/shared/wallet-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, Skull } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { TwitterUserAvatar } from "@/components/user/user-avatar"
import type { TokenFormValues } from "./_components/create-token-form"
import { HIDE_IDENTITY_SUI_FEE } from "@/constants/fees"
import { MIST_PER_SUI } from "@mysten/sui/utils"

export default function LaunchPage() {
	const { isConnected, isConnecting, connect } = useApp()
	const { isLoggedIn, login, user } = useTwitter()
	const [tokenData, setTokenData] = useState<Partial<TokenFormValues>>({})

	if (!isConnected) {
		return (
			<div className="container max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] p-6">
				{isConnecting && (
					<div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
						<Card className="border-0 shadow-none bg-transparent">
							<CardContent className="flex flex-col items-center space-y-4 pt-6">
								<div className="relative">
									<RefreshCw className="h-12 w-12 animate-spin text-primary" />
									<div className="absolute inset-0 animate-ping">
										<RefreshCw className="h-12 w-12 text-primary opacity-20" />
									</div>
								</div>
								<p className="text-sm text-muted-foreground animate-pulse">Connecting to wallet...</p>
							</CardContent>
						</Card>
					</div>
				)}

				<Card className="w-full border-2 shadow-xl">
					<CardHeader className="text-center space-y-6">
						<div className="space-y-2">
							<CardTitle className="text-3xl font-bold tracking-tight sm:text-4xl">
								Connect Your Wallet
							</CardTitle>
							<CardDescription className="text-base max-w-md mx-auto">
								You need to connect a wallet to launch new coins. Select your preferred wallet from the
								options below.
							</CardDescription>
						</div>
					</CardHeader>
					<CardContent>
						<WalletList onSelect={connect} isConnecting={isConnecting} />
					</CardContent>
				</Card>
			</div>
		)
	}

	if (!isLoggedIn) {
		return (
			<div className="container max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] p-6">
				{isConnecting && (
					<div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
						<Card className="border-0 shadow-none bg-transparent">
							<CardContent className="flex flex-col items-center space-y-4 pt-6">
								<div className="relative">
									<RefreshCw className="h-12 w-12 animate-spin text-primary" />
									<div className="absolute inset-0 animate-ping">
										<RefreshCw className="h-12 w-12 text-primary opacity-20" />
									</div>
								</div>
								<p className="text-sm text-muted-foreground animate-pulse">Connecting to wallet...</p>
							</CardContent>
						</Card>
					</div>
				)}

				<Card className="w-full border-2 shadow-xl">
					<CardHeader className="text-center space-y-6">
						<div className="space-y-2">
							<CardTitle className="text-3xl font-bold tracking-tight sm:text-4xl">
								Connect Your X/Twitter
							</CardTitle>
							<CardDescription className="text-base max-w-md mx-auto">
								You need to sign in with X/Twitter to launch coins. When creating tokens you can choose to
								hide your identity.
							</CardDescription>
						</div>
					</CardHeader>
					<CardContent>
						<Button className="w-full" onClick={login}>
							Connect with X/Twitter
						</Button>
					</CardContent>
				</Card>
			</div>
		)
	}

	return (
		<div className="space-y-16">
			<div className="text-center border-b pb-6">
				<h1 className="text-4xl font-bold font-mono uppercase tracking-wider text-foreground/80 mb-2">
					LAUNCH::TOKEN
				</h1>
				<p className="font-mono text-sm uppercase text-muted-foreground">LAUNCH_FAST_TRADE_FAST</p>
			</div>

			<div className="grid lg:grid-cols-3 gap-8 items-start">
				<div className="lg:col-span-2">
					<div className="space-y-4">
						<Alert variant="destructive" className="shadow-md">
							<Skull className="h-4 w-4" />
							<AlertTitle className="font-mono uppercase">IDENTITY::WARNING</AlertTitle>
							<AlertDescription className="font-mono text-xs uppercase">
								YOUR TWITTER USERNAME WILL BE PUBLICLY DISPLAYED AS THE TOKEN CREATOR.
								<br />
								PAY {Number(HIDE_IDENTITY_SUI_FEE) / Number(MIST_PER_SUI)} SUI TO REMAIN ANONYMOUS.
							</AlertDescription>
						</Alert>

						<CreateTokenForm onFormChange={setTokenData} />
					</div>
				</div>

				<div className="lg:col-span-1">
					<Card className="border-2 bg-background/50 backdrop-blur-sm shadow-xl">
						<CardHeader className="pb-4 border-b">
							<CardTitle className="text-lg font-mono uppercase tracking-wider">TOKEN::PREVIEW</CardTitle>
						</CardHeader>
						<CardContent>
							{tokenData.imageUrl || tokenData.name || tokenData.symbol ? (
								<div className="space-y-6">
									{/* Token Display */}
									<div className="flex items-center gap-4">
										{tokenData.imageUrl ? (
											<div className="relative">
												<div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
												<img
													src={tokenData.imageUrl}
													alt={tokenData.name || "Token"}
													className="relative w-20 h-20 rounded-lg object-cover border-2"
												/>
											</div>
										) : (
											<div className="w-20 h-20 rounded-lg bg-foreground/5 border-2 border-dashed flex items-center justify-center">
												<Skull className="w-8 h-8 text-muted-foreground" />
											</div>
										)}

										<div className="flex-1 space-y-1">
											<h3 className="text-xl font-mono font-bold tracking-tight">
												{tokenData.name || "[UNNAMED]"}
											</h3>
											<p className="text-lg font-mono text-primary">${tokenData.symbol || "???"}</p>
										</div>
									</div>

									{/* Creator Info */}
									{user && !tokenData.hideIdentity && (
										<div className="pt-4 border-t">
											<p className="text-xs font-mono text-muted-foreground mb-3 uppercase">
												CREATOR::IDENTITY
											</p>
											<a
												href={`https://twitter.com/${user.username}`}
												target="_blank"
												rel="noopener noreferrer"
												className="flex items-center gap-3 group"
											>
												<div className="relative">
													<div className="absolute inset-0 bg-primary/20 blur-md rounded-full opacity-0 group-hover:opacity-100 duration-300 ease-in-out transition-opacity" />
													<TwitterUserAvatar
														user={user}
														className="relative h-10 w-10 rounded-full border-2"
													/>
												</div>
												<div>
													<p className="font-mono text-sm group-hover:text-primary duration-300 ease-in-out transition-colors">
														@{user.username}
													</p>
													<p className="font-mono text-xs text-muted-foreground">
														VERIFIED::HUMAN
													</p>
												</div>
											</a>
										</div>
									)}

									{tokenData.hideIdentity && (
										<div className="pt-4 border-t">
											<p className="text-xs font-mono text-muted-foreground mb-3 uppercase">
												CREATOR::IDENTITY
											</p>
											<div className="flex items-center gap-3">
												<div className="h-10 w-10 rounded-full bg-foreground/10 border-2 flex items-center justify-center">
													<Skull className="h-5 w-5 text-foreground/40" />
												</div>
												<div>
													<p className="font-mono text-sm uppercase text-foreground/80">
														[REDACTED]
													</p>
													<p className="font-mono text-xs uppercase text-muted-foreground">
														IDENTITY::HIDDEN
													</p>
												</div>
											</div>
										</div>
									)}
								</div>
							) : (
								<div className="text-center py-8">
									<Skull className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
									<p className="font-mono text-sm uppercase text-muted-foreground">AWAITING::INPUT</p>
									<p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">
										FILL_FORM_TO_PREVIEW
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}
