/**
 * Known wallet addresses and their labels
 * These are displayed throughout the app to help users identify important addresses
 */
export const WALLET_LABELS: Record<string, string> = {
	"0x881d835c410f33a1decd8067ce04f6c2ec63eaca196235386b44d315c2152797": "BLAST.FUN TREASURY",
	"0xdc19b2928f31b6df46478e4ad9a309aaff6e958a3b568d4bb76264f767bdfbfc": "GIVEREP TEAM",
}

/**
 * Get the label for a wallet address if it exists
 * @param address - The wallet address to look up
 * @returns The label if found, undefined otherwise
 */
export function getWalletLabel(address: string): string | undefined {
	return WALLET_LABELS[address.toLowerCase()]
}

/**
 * Check if an address is a known special wallet
 * @param address - The wallet address to check
 * @returns True if the address has a label
 */
export function isKnownWallet(address: string): boolean {
	return address.toLowerCase() in WALLET_LABELS
}