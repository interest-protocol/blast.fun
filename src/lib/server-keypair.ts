import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519"
import { env } from "@/env"

export const getServerKeypair = () => {
	if (!env.SUI_PRIVATE_KEY) {
		throw new Error("Private key is missing from environment variables.")
	}

	return Ed25519Keypair.fromSecretKey(env.SUI_PRIVATE_KEY)
}
