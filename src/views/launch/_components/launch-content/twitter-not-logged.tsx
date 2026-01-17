"use client"

import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTwitter } from "@/context/twitter.context"
import { FC } from "react"

const TwitterNotLogged: FC = () => {
	const { isLoading, login } = useTwitter()

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
						X_AUTH_REQUIRED_FOR_TOKEN_LAUNCH
					</p>
				</div>

				<div className="w-full max-w-md mx-auto space-y-6">
					<div className="border-t border-foreground/10 pt-8">
						<Button
							className="w-full font-mono uppercase tracking-wider py-6 text-base border-2 border-foreground/20 hover:border-primary/50 transition-all duration-300"
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

export default TwitterNotLogged;