/* eslint-disable @next/next/no-img-element */
"use client"

import { ShieldCheck } from "lucide-react"
import { useState, useCallback, FC } from "react"
import { TwitterUserAvatar } from "@/components/user/user-avatar"
import { useApp } from "@/context/app.context"
import { useTwitter } from "@/context/twitter.context"
import CreateTokenForm from "../create-token-form"
import { ConfettiProvider } from "@/components/shared/confetti"
import { Logo } from "@/components/ui/logo"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import WalletNotConnected from "./wallet-not-connected"
import TwitterNotLogged from "./twitter-not-logged"
import { TokenFormValues } from "../create-token-form/create-token-form.types"

const LaunchContent: FC = () => {
	const { isConnected } = useApp()
	const { isLoggedIn, user } = useTwitter()
	const [tokenData, setTokenData] = useState<Partial<TokenFormValues>>({})
	const [protectionActive, setProtectionActive] = useState(false)

	const handleFormChange = useCallback((data: Partial<TokenFormValues>) => {
		setTokenData(data)
		const hasProtection = !!data.sniperProtection
		setProtectionActive(hasProtection)
	}, [])

	if (!isConnected) {
		return (
			<WalletNotConnected />
		)
	}

	if (!isLoggedIn) {
		return (
			<TwitterNotLogged />
		)
	}

	return (
		<ConfettiProvider>
			<div className="space-y-16">
				<div className="grid lg:grid-cols-3 gap-8 items-start">
					<div className="lg:col-span-2">
						<div className="space-y-4">

							<CreateTokenForm onFormChange={handleFormChange} />
						</div>
					</div>

					<div className="lg:col-span-1">
						<div className="border-2 shadow-lg rounded-xl">
							<div className="p-4 border-b">
								<h3 className="text-lg font-mono uppercase tracking-wider text-foreground/80">
									TOKEN PREVIEW
								</h3>
							</div>

							<div className="p-4 space-y-4">

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
													<Logo className="w-8 h-8 animate-pulse" />
												</div>
											)}

											<div className="flex-1 space-y-1">
												<div className="flex items-center gap-2">
													<h3 className="text-xl font-mono font-bold tracking-tight">
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
															className="relative h-10 w-10 rounded-lg border-2"
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
													<div className="h-10 w-10 rounded-lg bg-foreground/10 border-2 flex items-center justify-center">
														<Logo className="h-5 w-5" />
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
										<Logo className="w-12 h-12 mx-auto mb-4 animate-bounce" />
										<p className="font-mono text-sm uppercase text-muted-foreground">AWAITING::INPUT</p>
										<p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">
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

export default LaunchContent;