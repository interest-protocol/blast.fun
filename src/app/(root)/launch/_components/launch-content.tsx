"use client"

import { Loader2, ShieldCheck } from "lucide-react"
import { useCallback, useState } from "react"
import { ConfettiProvider } from "@/components/shared/confetti"
import { WalletList } from "@/components/shared/wallet-list"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { TwitterUserAvatar } from "@/components/user/user-avatar"
import { useApp } from "@/context/app.context"
import { useTwitter } from "@/context/twitter.context"
import type { TokenFormValues } from "./create-token-form"
import CreateTokenForm from "./create-token-form"

export default function LaunchContent() {
	const { isConnected, isConnecting, connect } = useApp()
	const { isLoggedIn, isLoading, login, user } = useTwitter()
	const [tokenData, setTokenData] = useState<Partial<TokenFormValues>>({})
	const [protectionActive, setProtectionActive] = useState(false)

	const handleFormChange = useCallback((data: Partial<TokenFormValues>) => {
		setTokenData(data)
		const hasProtection = !!data.sniperProtection
		setProtectionActive(hasProtection)
	}, [])

	if (!isConnected) {
		return (
			<div className="container mx-auto flex min-h-[calc(100vh-12rem)] max-w-2xl flex-col items-center justify-center">
				{isConnecting && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md">
						<div className="flex flex-col items-center space-y-6">
							<div className="relative">
								<div className="absolute inset-0 animate-pulse bg-primary/20 blur-2xl" />
								<Loader2 className="relative h-16 w-16 animate-spin text-foreground/60" />
								<div className="absolute inset-0 animate-ping">
									<Loader2 className="h-16 w-16 text-primary opacity-10" />
								</div>
							</div>
							<div className="space-y-2 text-center">
								<p className="animate-pulse font-mono text-foreground/80 text-sm uppercase tracking-wider">
									WALLET::CONNECTING
								</p>
								<p className="font-mono text-muted-foreground/60 text-xs uppercase">
									ESTABLISHING_SECURE_CONNECTION...
								</p>
							</div>
						</div>
					</div>
				)}

				<div className="w-full space-y-8 text-center">
					<div className="space-y-6">
						<h1 className="font-bold font-mono text-4xl text-foreground/80 uppercase tracking-wider sm:text-5xl">
							WALLET::REQUIRED
						</h1>
						<p className="mx-auto max-w-md font-mono text-muted-foreground text-sm uppercase">
							CONNECT_WALLET_TO_LAUNCH_TOKENS
						</p>
					</div>

					<div className="mx-auto w-full max-w-md space-y-4">
						<div className="border-foreground/10 border-t pt-6">
							<p className="mb-6 font-mono text-muted-foreground/60 text-xs uppercase">AVAILABLE::WALLETS</p>
							<WalletList onSelect={connect} isConnecting={isConnecting} />
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (!isLoggedIn) {
		return (
			<div className="container mx-auto flex min-h-[calc(100vh-12rem)] max-w-2xl flex-col items-center justify-center">
				{isLoading && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md">
						<div className="flex flex-col items-center space-y-6">
							<div className="relative">
								<div className="absolute inset-0 animate-pulse bg-primary/20 blur-2xl" />
								<Loader2 className="relative h-16 w-16 animate-spin text-foreground/60" />
								<div className="absolute inset-0 animate-ping">
									<Loader2 className="h-16 w-16 text-primary opacity-10" />
								</div>
							</div>
							<div className="space-y-2 text-center">
								<p className="animate-pulse font-mono text-foreground/80 text-sm uppercase tracking-wider">
									IDENTITY::VERIFYING
								</p>
								<p className="font-mono text-muted-foreground/60 text-xs uppercase">
									AUTHENTICATING_SOCIAL_CREDENTIALS...
								</p>
							</div>
						</div>
					</div>
				)}

				<div className="w-full space-y-8 text-center">
					<div className="space-y-6">
						<h1 className="font-bold font-mono text-4xl text-foreground/80 uppercase tracking-wider sm:text-5xl">
							IDENTITY::REQUIRED
						</h1>
						<p className="mx-auto max-w-md font-mono text-muted-foreground text-sm uppercase">
							X_AUTH_REQUIRED_FOR_TOKEN_LAUNCH
						</p>
					</div>

					<div className="mx-auto w-full max-w-md space-y-6">
						<div className="border-foreground/10 border-t pt-8">
							<Button
								className="w-full border-2 border-foreground/20 py-6 font-mono text-base uppercase tracking-wider transition-all duration-300 hover:border-primary/50"
								onClick={login}
							>
								CONNECT X
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
				<div className="grid items-start gap-8 lg:grid-cols-3">
					<div className="lg:col-span-2">
						<div className="space-y-4">
							<CreateTokenForm onFormChange={handleFormChange} />
						</div>
					</div>

					<div className="lg:col-span-1">
						<div className="rounded-xl border-2 shadow-lg">
							<div className="border-b p-4">
								<h3 className="font-mono text-foreground/80 text-lg uppercase tracking-wider">
									TOKEN::PREVIEW
								</h3>
							</div>

							<div className="space-y-4 p-4">
								{tokenData.imageUrl || tokenData.name || tokenData.symbol ? (
									<div className="space-y-6">
										{/* Token Display */}
										<div className="flex items-center gap-4">
											{tokenData.imageUrl ? (
												<div className="relative">
													<div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
													<img
														src={tokenData.imageUrl}
														alt={tokenData.name || "Token"}
														className="relative h-20 w-20 rounded-lg border-2 object-cover"
													/>
												</div>
											) : (
												<div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed bg-foreground/5">
													<Logo className="h-8 w-8 animate-pulse" />
												</div>
											)}

											<div className="flex-1 space-y-1">
												<div className="flex items-center gap-2">
													<h3 className="font-bold font-mono text-xl tracking-tight">
														{tokenData.name || "[UNNAMED]"}
													</h3>

													{protectionActive && (
														<Tooltip>
															<TooltipTrigger asChild>
																<ShieldCheck className="h-5 w-5 text-green-400/80" />
															</TooltipTrigger>
															<TooltipContent>
																This token has anti-sniper protections active.
															</TooltipContent>
														</Tooltip>
													)}
												</div>

												<p className="font-mono text-lg text-primary">
													${tokenData.symbol || "???"}
												</p>
											</div>
										</div>

										{/* Creator Info */}
										{user && !tokenData.hideIdentity && (
											<div className="border-t pt-4">
												<p className="mb-3 font-mono text-muted-foreground text-xs uppercase">
													CREATOR::IDENTITY
												</p>
												<a
													href={`https://twitter.com/${user.username}`}
													target="_blank"
													rel="noopener noreferrer"
													className="group flex items-center gap-3"
												>
													<div className="relative">
														<div className="absolute inset-0 rounded-full bg-primary/20 opacity-0 blur-md transition-opacity duration-300 ease-in-out group-hover:opacity-100" />
														<TwitterUserAvatar
															user={user}
															className="relative h-10 w-10 rounded-lg border-2"
														/>
													</div>
													<div>
														<p className="font-mono text-sm transition-colors duration-300 ease-in-out group-hover:text-primary">
															@{user.username}
														</p>
														<p className="font-mono text-muted-foreground text-xs">
															VERIFIED::HUMAN
														</p>
													</div>
												</a>
											</div>
										)}

										{tokenData.hideIdentity && (
											<div className="border-t pt-4">
												<p className="mb-3 font-mono text-muted-foreground text-xs uppercase">
													CREATOR::IDENTITY
												</p>
												<div className="flex items-center gap-3">
													<div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 bg-foreground/10">
														<Logo className="h-5 w-5" />
													</div>
													<div>
														<p className="font-mono text-foreground/80 text-sm uppercase">
															[REDACTED]
														</p>
														<p className="font-mono text-muted-foreground text-xs uppercase">
															IDENTITY::HIDDEN
														</p>
													</div>
												</div>
											</div>
										)}
									</div>
								) : (
									<div className="py-8 text-center">
										<Logo className="mx-auto mb-4 h-12 w-12 animate-bounce" />
										<p className="font-mono text-muted-foreground text-sm uppercase">AWAITING::INPUT</p>
										<p className="mt-2 font-mono text-muted-foreground/60 text-xs uppercase">
											FILL_FORM_TO_PREVIEW
										</p>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</ConfettiProvider>
	)
}
