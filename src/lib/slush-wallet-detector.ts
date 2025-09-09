import { getWallets } from "@mysten/wallet-standard"

// @dev: Utility to detect if user is in Slush wallet mobile browser
export function isSlushWalletBrowser(): boolean {
	// @dev: Check if we're in a browser environment
	if (typeof window === "undefined") {
		return false
	}

	// @dev: Check if this is a mobile device
	const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
		navigator.userAgent
	)

	if (!isMobile) {
		return false
	}

	try {
		// @dev: Use Wallet Standard to check for Slush wallet
		const walletsApi = getWallets()
		const wallets = walletsApi.get()
		
		// @dev: Check if Slush wallet is registered
		const hasSlushWallet = wallets.some(wallet => 
			wallet.name.toLowerCase().includes("slush") ||
			wallet.name === "Slush Wallet" ||
			wallet.name === "SlushWallet"
		)

		if (hasSlushWallet) {
			return true
		}
	} catch (error) {
		console.warn("Failed to check wallets via Wallet Standard:", error)
	}

	// @dev: Fallback to checking window object properties
	const hasSlushWalletFallback = 
		(window as any).slush !== undefined ||
		(window as any).slushWallet !== undefined ||
		(window as any).SlushWallet !== undefined ||
		// @dev: Check for Sui wallets that might be Slush
		((window as any).sui && (window as any).sui.slush) ||
		// @dev: Check if the user agent contains Slush identifier
		navigator.userAgent.toLowerCase().includes("slush")

	return hasSlushWalletFallback
}

// @dev: Special bypass token for Slush wallet users
export const SLUSH_WALLET_BYPASS_TOKEN = "SLUSH_WALLET_MOBILE_BYPASS_2025"