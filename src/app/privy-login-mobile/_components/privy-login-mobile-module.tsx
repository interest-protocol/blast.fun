"use client"

import React, { useEffect } from "react"
import { usePrivy } from "@privy-io/react-auth"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import PrivyApiService from "@/services/privy-api.service"
import toast from "react-hot-toast"
import { Key, Sparkles, Zap } from "lucide-react"

const PrivyLoginMobileModule = () => {
	const { login, logout, getAccessToken, ready, authenticated } = usePrivy()
	const searchParams = useSearchParams()
	const router = useRouter()
	const pathname = usePathname()

	const handleContinue = async () => {
		try {
			login() // opens modal
		} catch (error: any) {
			console.error(error)
			toast.error(`Failed to continue with Quick Account: ${error.message}`)
		}
	}

	const handlePrivyLogin = async () => {
		try {
			const token = await getAccessToken()
			if (!token) {
				return
			}

			const walletResponse = await PrivyApiService.createOrGetUserWallet(token as string)
			const wallet = walletResponse.data

			toast.success("Successfully logged in with Privy")
			
			// @dev: Redirect to home page or handle mobile app deep link
			const returnUrl = searchParams.get("returnUrl") || "/"
			
			// @dev: Check if this is from mobile app
			const source = searchParams.get("source")
			if (source === "mobile-app") {
				// @dev: Deep link to mobile app
				window.location.href = `blastfun://privy-auth?accessToken=${token}&address=${wallet.address}&walletType=privy`
			} else {
				// @dev: Redirect to web app
				router.push(returnUrl)
			}
		} catch (err) {
			console.error(err)
			toast.error("Failed to complete login")
		}
	}

	const handlePageLoad = async () => {
		try {
			// @dev: logout only if ?source in url is 'nexa-mobile' or 'reset'
			const source = searchParams.get("source")

			if (source === "nexa-mobile" || source === "reset") {
				await logout()
				// @dev: remove ?source from url
				const nextSearchParams = new URLSearchParams(searchParams.toString())
				nextSearchParams.delete("source")

				router.replace(`${pathname}?${nextSearchParams}`)
			}
		} catch (error: any) {
			console.error(error)
		}
	}

	useEffect(() => {
		if (ready) {
			handlePageLoad()
		}

		if (authenticated) {
			handlePrivyLogin()
		}
	}, [ready, authenticated])

	return (
		<div className="min-h-screen flex items-center justify-center bg-background p-4">
			<div className="w-full max-w-md space-y-6">
				<Link href="/" className="flex justify-center">
					<h1 className="text-3xl font-bold text-primary">BLAST.FUN</h1>
				</Link>

				<Card>
					<CardHeader>
						<CardTitle>Quick Account Login</CardTitle>
						<CardDescription>
							Login with your social accounts to access BLAST.FUN
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="space-y-4">
							<div className="flex gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
									<Zap className="h-5 w-5 text-primary" />
								</div>
								<div className="flex-1">
									<p className="font-medium">Lightning Fast Trading</p>
									<p className="text-sm text-muted-foreground">
										Trade instantly without wallet approvals for each transaction
									</p>
								</div>
							</div>

							<div className="flex gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
									<Sparkles className="h-5 w-5 text-primary" />
								</div>
								<div className="flex-1">
									<p className="font-medium">Easy Onboarding</p>
									<p className="text-sm text-muted-foreground">
										Login with Google, Twitter, or Discord to get started
									</p>
								</div>
							</div>

							<div className="flex gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
									<Key className="h-5 w-5 text-primary" />
								</div>
								<div className="flex-1">
									<p className="font-medium">Secure & Non-Custodial</p>
									<p className="text-sm text-muted-foreground">
										Your account is powered by Privy and secured by Nexa&apos;s infrastructure
									</p>
								</div>
							</div>
						</div>

						<div className="space-y-3">
							<Button onClick={handleContinue} className="w-full" size="lg">
								Continue with Quick Account
							</Button>
							
							<Button 
								onClick={() => router.push("/")} 
								variant="outline" 
								className="w-full"
							>
								Cancel
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}

export default PrivyLoginMobileModule