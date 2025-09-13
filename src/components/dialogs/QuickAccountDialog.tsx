"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Zap, Sparkles, Shield, Loader2 } from "lucide-react"
import { usePrivyAuth } from "@/hooks/privy/use-privy-auth"

interface QuickAccountDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function QuickAccountDialog({ open, onOpenChange }: QuickAccountDialogProps) {
	const { login, isAuthenticated, isReady } = usePrivyAuth()
	const [isLoading, setIsLoading] = useState(false)
	
	// @dev: Track if we started a login attempt
	const [hasStartedLogin, setHasStartedLogin] = useState(false)
	
	// @dev: Close dialog only after a successful new authentication
	useEffect(() => {
		// Only close if we started login and now authenticated
		if (isAuthenticated && open && hasStartedLogin) {
			onOpenChange(false)
			setIsLoading(false)
			setHasStartedLogin(false)
		}
	}, [isAuthenticated, open, hasStartedLogin, onOpenChange])
	
	const handleContinue = async () => {
		// @dev: Call Privy login directly - Solana wallets don't need OAuth redirect
		setIsLoading(true)
		setHasStartedLogin(true)
		try {
			await login()
			// @dev: Dialog will auto-close when isAuthenticated becomes true
		} catch (error) {
			// Reset if login fails
			setIsLoading(false)
			setHasStartedLogin(false)
		}
	}
	
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md p-0 overflow-hidden">
				<div className="bg-background p-8">
					<DialogHeader className="text-center mb-6">
						<DialogTitle className="text-2xl font-bold mb-2">Quick Account Login</DialogTitle>
						<DialogDescription className="text-muted-foreground">
							Connect your Solana wallet to access BLAST.FUN
						</DialogDescription>
					</DialogHeader>
					
					<div className="space-y-4 mb-8">
						<div className="flex items-start gap-3">
							<div className="p-2 rounded-lg bg-primary/10">
								<Zap className="h-5 w-5 text-primary" />
							</div>
							<div>
								<h3 className="font-semibold mb-1">Lightning Fast Trading</h3>
								<p className="text-sm text-muted-foreground">
									Trade instantly without wallet approvals for each transaction
								</p>
							</div>
						</div>
						
						<div className="flex items-start gap-3">
							<div className="p-2 rounded-lg bg-primary/10">
								<Sparkles className="h-5 w-5 text-primary" />
							</div>
							<div>
								<h3 className="font-semibold mb-1">Easy Onboarding</h3>
								<p className="text-sm text-muted-foreground">
									Connect with Phantom, Solflare, or any Solana wallet
								</p>
							</div>
						</div>
						
						<div className="flex items-start gap-3">
							<div className="p-2 rounded-lg bg-primary/10">
								<Shield className="h-5 w-5 text-primary" />
							</div>
							<div>
								<h3 className="font-semibold mb-1">Secure & Non-Custodial</h3>
								<p className="text-sm text-muted-foreground">
									Your account is powered by Privy and secured by Nexa&apos;s infrastructure
								</p>
							</div>
						</div>
					</div>
					
					<div className="space-y-3">
						<Button 
							onClick={handleContinue}
							className="w-full"
							size="lg"
							disabled={isLoading || !isReady}
						>
							{isLoading ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Connecting...
								</>
							) : (
								"Continue with Quick Account"
							)}
						</Button>
						
						<Button 
							onClick={() => onOpenChange(false)}
							variant="ghost"
							className="w-full"
							size="lg"
							disabled={isLoading}
						>
							Cancel
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}