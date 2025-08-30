"use client"

import { usePrivy, useLogin } from "@privy-io/react-auth"
import { useEffect, useState, useCallback } from "react"
import toast from "react-hot-toast"

export interface PrivyAuthState {
	isAuthenticated: boolean
	isReady: boolean
	isLoading: boolean
	user: any
	googleEmail?: string
	twitterUsername?: string
	discordUsername?: string
	login: () => void
	logout: () => void
	linkGoogle: () => void
	linkTwitter: () => void
	linkDiscord: () => void
	unlinkGoogle: (subject: string) => void
	unlinkTwitter: (subject: string) => void
	unlinkDiscord: (subject: string) => void
	refreshUser: () => void
}

export function usePrivyAuth(): PrivyAuthState {
	const { 
		ready, 
		authenticated, 
		user, 
		logout: privyLogout,
		linkGoogle: privyLinkGoogle,
		linkTwitter: privyLinkTwitter,
		linkDiscord: privyLinkDiscord,
		unlinkGoogle: privyUnlinkGoogle,
		unlinkTwitter: privyUnlinkTwitter,
		unlinkDiscord: privyUnlinkDiscord,
	} = usePrivy()
	
	const { login: privyLogin } = useLogin({
		onComplete: ({ user, isNewUser }) => {
			if (isNewUser) {
				toast.success("Welcome to BLAST.FUN!")
			} else {
				toast.success("Welcome back!")
			}
		},
		onError: (error) => {
			console.error("Login error:", error)
			toast.error("Failed to login. Please try again.")
		},
	})
	
	const [isLoading, setIsLoading] = useState(false)
	const [googleEmail, setGoogleEmail] = useState<string>()
	const [twitterUsername, setTwitterUsername] = useState<string>()
	const [discordUsername, setDiscordUsername] = useState<string>()

	// @dev: Extract account information from linked accounts
	useEffect(() => {
		if (user?.linkedAccounts) {
			// @dev: Extract Google
			const googleAccount = user.linkedAccounts.find((account: any) => account.type === "google_oauth")
			if (googleAccount && 'email' in googleAccount) {
				setGoogleEmail(googleAccount.email || undefined)
			}

			// @dev: Extract Twitter
			const twitterAccount = user.linkedAccounts.find((account: any) => account.type === "twitter_oauth")
			if (twitterAccount && 'username' in twitterAccount) {
				setTwitterUsername(twitterAccount.username || undefined)
			}

			// @dev: Extract Discord
			const discordAccount = user.linkedAccounts.find((account: any) => account.type === "discord_oauth")
			if (discordAccount && 'username' in discordAccount) {
				setDiscordUsername(discordAccount.username || undefined)
			}
		}
	}, [user])

	const login = useCallback(async () => {
		setIsLoading(true)
		try {
			await privyLogin()
		} finally {
			setIsLoading(false)
		}
	}, [privyLogin])

	const logout = useCallback(async () => {
		setIsLoading(true)
		try {
			await privyLogout()
			setGoogleEmail(undefined)
			setTwitterUsername(undefined)
			setDiscordUsername(undefined)
			toast.success("Logged out successfully")
		} finally {
			setIsLoading(false)
		}
	}, [privyLogout])

	const linkGoogle = useCallback(async () => {
		setIsLoading(true)
		try {
			await privyLinkGoogle()
			toast.success("Google account linked successfully")
		} catch (error) {
			console.error("Link Google error:", error)
			toast.error("Failed to link Google account")
		} finally {
			setIsLoading(false)
		}
	}, [privyLinkGoogle])

	const linkTwitter = useCallback(async () => {
		setIsLoading(true)
		try {
			await privyLinkTwitter()
			toast.success("Twitter account linked successfully")
		} catch (error) {
			console.error("Link Twitter error:", error)
			toast.error("Failed to link Twitter account")
		} finally {
			setIsLoading(false)
		}
	}, [privyLinkTwitter])

	const linkDiscord = useCallback(async () => {
		setIsLoading(true)
		try {
			await privyLinkDiscord()
			toast.success("Discord account linked successfully")
		} catch (error) {
			console.error("Link Discord error:", error)
			toast.error("Failed to link Discord account")
		} finally {
			setIsLoading(false)
		}
	}, [privyLinkDiscord])

	const unlinkGoogle = useCallback(async (subject: string) => {
		setIsLoading(true)
		try {
			await privyUnlinkGoogle(subject)
			setGoogleEmail(undefined)
			toast.success("Google account unlinked successfully")
		} catch (error) {
			console.error("Unlink Google error:", error)
			toast.error("Failed to unlink Google account")
		} finally {
			setIsLoading(false)
		}
	}, [privyUnlinkGoogle])

	const unlinkTwitter = useCallback(async (subject: string) => {
		setIsLoading(true)
		try {
			await privyUnlinkTwitter(subject)
			setTwitterUsername(undefined)
			toast.success("Twitter account unlinked successfully")
		} catch (error) {
			console.error("Unlink Twitter error:", error)
			toast.error("Failed to unlink Twitter account")
		} finally {
			setIsLoading(false)
		}
	}, [privyUnlinkTwitter])

	const unlinkDiscord = useCallback(async (subject: string) => {
		setIsLoading(true)
		try {
			await privyUnlinkDiscord(subject)
			setDiscordUsername(undefined)
			toast.success("Discord account unlinked successfully")
		} catch (error) {
			console.error("Unlink Discord error:", error)
			toast.error("Failed to unlink Discord account")
		} finally {
			setIsLoading(false)
		}
	}, [privyUnlinkDiscord])

	const refreshUser = useCallback(() => {
		// @dev: Privy automatically refreshes user data
		// This is a placeholder for manual refresh if needed
	}, [])

	return {
		isAuthenticated: authenticated,
		isReady: ready,
		isLoading,
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
		refreshUser,
	}
}