"use client"

import { MIST_PER_SUI } from "@mysten/sui/utils"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { WalletList } from "@/components/shared/wallet-list"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TwitterUserAvatar } from "@/components/user/user-avatar"
import { HIDE_IDENTITY_SUI_FEE } from "@/constants/fees"
import { useApp } from "@/context/app.context"
import { useTwitter } from "@/context/twitter.context"
import type { TokenFormValues } from "./create-token-form"
import CreateTokenForm from "./create-token-form"
import { ConfettiProvider } from "@/components/shared/confetti"
import { Logo } from "@/components/ui/logo"

export default function LaunchContent() {
	const { isConnected, isConnecting, connect } = useApp()
	const { isLoggedIn, isLoading, login, user } = useTwitter()
	const [tokenData, setTokenData] = useState<Partial<TokenFormValues>>({})

	if (!isConnected) {
		return (
			<div className="container max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
				{isConnecting && (
					<div className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 flex items-center justify-center">
						<div className="flex flex-col items-center space-y-6">
							<div className="relative">
								<div className="absolute inset-0 bg-primary/20 blur-2xl animate-pulse" />
								<Loader2 className="h-16 w-16 animate-spin text-foreground/60 relative" />
								<div className="absolute inset-0 animate-ping">
									<Loader2 className="h-16 w-16 text-primary opacity-10" />
								</div>
							</div>
							<div className="text-center space-y-2">
								<p className="text-sm font-mono uppercase text-foreground/80 animate-pulse tracking-wider">
									WALLET::CONNECTING
								</p>
								<p className="text-xs font-mono uppercase text-muted-foreground/60">
									ESTABLISHING_SECURE_CONNECTION...
								</p>
							</div>
						</div>
					</div>
				)}

				<div className="w-full space-y-8 text-center">
					<div className="space-y-6">
						<h1 className="text-4xl font-bold font-mono uppercase tracking-wider text-foreground/80 sm:text-5xl">
							WALLET::REQUIRED
						</h1>
						<p className="text-sm font-mono uppercase max-w-md mx-auto text-muted-foreground">
							CONNECT_WALLET_TO_LAUNCH_TOKENS
						</p>
					</div>

					<div className="w-full max-w-md mx-auto space-y-4">
						<div className="border-t border-foreground/10 pt-6">
							<p className="text-xs font-mono text-muted-foreground/60 mb-6 uppercase">AVAILABLE::WALLETS</p>
							<WalletList onSelect={connect} isConnecting={isConnecting} />
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (!isLoggedIn) {
		return (
			<div className="container max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
				{isLoading && (
					<div className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 flex items-center justify-center">
						<div className="flex flex-col items-center space-y-6">
							<div className="relative">
								<div className="absolute inset-0 bg-primary/20 blur-2xl animate-pulse" />
								<Loader2 className="h-16 w-16 animate-spin text-foreground/60 relative" />
								<div className="absolute inset-0 animate-ping">
									<Loader2 className="h-16 w-16 text-primary opacity-10" />
								</div>
							</div>
							<div className="text-center space-y-2">
								<p className="text-sm font-mono uppercase text-foreground/80 animate-pulse tracking-wider">
									IDENTITY::VERIFYING
								</p>
								<p className="text-xs font-mono uppercase text-muted-foreground/60">
									AUTHENTICATING_SOCIAL_CREDENTIALS...
								</p>
							</div>
						</div>
					</div>
				)}

				<div className="w-full space-y-8 text-center">
					<div className="space-y-6">
						<h1 className="text-4xl font-bold font-mono uppercase tracking-wider text-foreground/80 sm:text-5xl">
							IDENTITY::REQUIRED
						</h1>
						<p className="text-sm font-mono uppercase max-w-md mx-auto text-muted-foreground">
							TWITTER_AUTH_REQUIRED_FOR_TOKEN_LAUNCH
						</p>
					</div>

					<div className="w-full max-w-md mx-auto space-y-6">
						<div className="border-t border-foreground/10 pt-8">
							<Button
								className="w-full font-mono uppercase tracking-wider py-6 text-base border-2 border-foreground/20 hover:border-primary/50 transition-all duration-300"
								onClick={login}
							>
								CONNECT::TWITTER
							</Button>
						</div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<ConfettiProvider>
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
								<Logo className="h-4 w-4" />
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
													<Logo className="w-8 h-8 text-muted-foreground" />
												</div>
											)}

											<div className="flex-1 space-y-1">
												<h3 className="text-xl font-mono font-bold tracking-tight">
													{tokenData.name || "[UNNAMED]"}
												</h3>
												<p className="text-lg font-mono text-primary">
													${tokenData.symbol || "???"}
												</p>
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
														<Logo className="h-5 w-5 text-foreground/40" />
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
										<Logo className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
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
		</ConfettiProvider>
	)
}